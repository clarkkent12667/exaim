import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GradingRequest {
  studentAnswer: string;
  modelAnswer: string;
  marks: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { studentAnswer, modelAnswer, marks }: GradingRequest = await req.json()

    if (!studentAnswer || !modelAnswer || !marks) {
      throw new Error('Missing required fields: studentAnswer, modelAnswer, marks')
    }

    // Build the prompt for GPT-4o-mini
    const prompt = `You are grading an open-ended question.

Model Answer: ${modelAnswer}
Student Answer: ${studentAnswer}
Total Marks: ${marks}

Compare the student's answer with the model answer. Consider:
- Key concepts and facts mentioned
- Accuracy of information
- Completeness of the response
- Understanding demonstrated

Return ONLY valid JSON:
{
  "status": "Correct|Partially Correct|Incorrect",
  "howToImprove": "Specific feedback on how the student can improve their answer",
  "marksAwarded": 0
}

Guidelines:
- Correct: Student demonstrates full understanding, covers all key points (award full marks)
- Partially Correct: Student shows some understanding but misses important points or has minor errors (award partial marks)
- Incorrect: Student shows little to no understanding or has major errors (award 0 marks)

Feedback Rules:
- If Correct: Show "Correct" and no improvement suggestions needed
- If Partially Correct: Show "Partially Correct" with specific improvement suggestions AND show the correct answer
- If Incorrect: Show "Incorrect" with specific improvement suggestions AND show the correct answer

IMPORTANT: For "Partially Correct" and "Incorrect" responses, your howToImprove field should include:
1. Specific improvement suggestions
2. The correct answer from the model answer

Format the howToImprove field like this:
"Specific improvement suggestions. Here is the correct answer: [model answer]"

- marksAwarded should be between 0 and ${marks}
- Always include the model answer in the howToImprove field when status is not "Correct"`

    // Call OpenAI GPT-4o-mini
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational assessor. Grade student answers fairly and provide constructive feedback. Return only valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    const generatedText = openaiData.choices[0]?.message?.content

    if (!generatedText) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let gradingResult
    try {
      gradingResult = JSON.parse(generatedText)
    } catch (error) {
      throw new Error(`Failed to parse OpenAI response as JSON: ${error.message}`)
    }

    // Validate the response structure
    if (!gradingResult.status || !gradingResult.howToImprove || gradingResult.marksAwarded === undefined) {
      throw new Error('Invalid response structure: missing required fields')
    }

    if (!['Correct', 'Partially Correct', 'Incorrect'].includes(gradingResult.status)) {
      throw new Error(`Invalid status: ${gradingResult.status}`)
    }

    if (gradingResult.marksAwarded < 0 || gradingResult.marksAwarded > marks) {
      throw new Error(`Invalid marks awarded: ${gradingResult.marksAwarded}`)
    }

    return new Response(
      JSON.stringify(gradingResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error grading open-ended question:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
