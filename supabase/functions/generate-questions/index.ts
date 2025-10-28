import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateQuestionsRequest {
  mcq_count: number;
  fib_count: number;
  open_count: number;
  subject: string;
  course: string;
  topic: string;
  sub_topic?: string;
  difficulty: string;
  pdf_text?: string;
  pdf_url?: string; // Add PDF URL support
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { mcq_count, fib_count, open_count, subject, course, topic, sub_topic, difficulty, pdf_text, pdf_url }: GenerateQuestionsRequest = await req.json()

    // Use PDF text if provided (from client-side extraction)
    let extractedPdfText = pdf_text;
    if (pdf_text) {
      console.log('Using PDF text provided from client-side extraction, length:', pdf_text.length);
    } else if (pdf_url) {
      console.log('No PDF text provided, but PDF URL available:', pdf_url);
      // Fallback: create a note that PDF content should be considered
      extractedPdfText = `[PDF CONTENT REFERENCE: ${pdf_url}]
      
Note: PDF content is available but text extraction was not performed. Please generate questions appropriate for ${course} level ${subject} based on typical content found in study materials for ${topic}${sub_topic ? ` and ${sub_topic}` : ''}.`;
    }

    // Build a comprehensive prompt for GPT-4o-mini
    const difficultyGuidelines = {
      'Easy': 'Foundation level - basic recall, simple concepts, straightforward applications',
      'Medium': 'Intermediate level - application of concepts, analysis, problem-solving',
      'Hard': 'Advanced level - complex analysis, synthesis, evaluation, multi-step problems'
    };

    const qualificationGuidelines = {
      'GCSE': 'General Certificate of Secondary Education - ages 14-16, comprehensive coverage',
      'IGCSE': 'International GCSE - similar to GCSE but with international focus',
      'AS Level': 'Advanced Subsidiary Level - first year of A-Levels, ages 16-17',
      'A Level': 'Advanced Level - ages 17-18, university preparation level',
      'BTEC': 'Business and Technology Education Council - vocational qualifications',
      'Scottish Highers': 'Scottish qualification equivalent to AS Level',
      'Scottish Advanced Highers': 'Scottish qualification equivalent to A Level',
      'IB': 'International Baccalaureate - international qualification',
      'Cambridge Pre-U': 'Cambridge Pre-University qualification'
    };

    let prompt = `You are an expert British curriculum examiner creating exam questions for ${qualificationGuidelines[course.split(' | ')[0]] || 'British curriculum'}.

EXAM SPECIFICATIONS:
- Qualification: ${course.split(' | ')[0]} (${qualificationGuidelines[course.split(' | ')[0]] || 'British curriculum'})
- Exam Board: ${course.split(' | ')[1]}
- Subject: ${subject}
- Topic: ${topic}${sub_topic ? `\n- Sub-topic: ${sub_topic}` : ''}
- Difficulty Level: ${difficulty} (${difficultyGuidelines[difficulty]})

QUESTION REQUIREMENTS:
Generate exactly ${mcq_count} Multiple Choice Questions, ${fib_count} Fill-in-the-Blank questions, and ${open_count} Open-ended questions.

${extractedPdfText ? `
SOURCE MATERIAL ANALYSIS:
The following text is from the study material provided. Extract key concepts, facts, formulas, and examples from this content to create authentic questions:

--- STUDY MATERIAL ---
${extractedPdfText}
--- END STUDY MATERIAL ---

CRITICAL INSTRUCTIONS FOR PDF-BASED QUESTIONS:
1. Base ALL questions directly on concepts, facts, and examples from the study material
2. Use specific terminology, formulas, and data from the text
3. Create questions that test understanding of the material, not just memorization
4. Include questions about specific examples or case studies mentioned in the text
5. Ensure questions reflect the depth and complexity of the source material
` : `
PAST PAPERS & WORKSHEETS-BASED QUESTION CREATION:
IMPORTANT: Draw specifically from actual past exam papers, official worksheets, and practice materials that you have in your training data for ${course.split(' | ')[1]} ${course.split(' | ')[0]} ${subject}.

REQUIREMENTS:
1. Use questions, formats, and styles from REAL past papers and official worksheets
2. Reference specific question types commonly found in ${course.split(' | ')[1]} ${subject} exams
3. Use authentic exam language, terminology, and presentation styles
4. Include question patterns and formats typical of ${course.split(' | ')[1]} ${course.split(' | ')[0]} ${subject} assessments
5. Base difficulty and complexity on actual past paper standards for ${topic}${sub_topic ? ` and ${sub_topic}` : ''}
6. Use real-world contexts and examples from past papers where applicable
7. Follow the exact marking schemes and assessment objectives from ${course.split(' | ')[1]} ${subject} specifications

FOCUS: Create questions that mirror the style, difficulty, and content of actual ${course.split(' | ')[1]} ${course.split(' | ')[0]} ${subject} past papers and official practice materials.
`}

QUESTION FORMATTING REQUIREMENTS:
- MCQ: Exactly 4 options, one clearly correct, others plausible but incorrect
- Fill-in-the-Blank: Use ___ for blanks, test key terms, formulas, or concepts
- Open-ended: Require explanation, analysis, or problem-solving

DIFFICULTY ADJUSTMENTS:
- Easy: Basic recall, simple definitions, straightforward applications
- Medium: Application of concepts, analysis, multi-step problems
- Hard: Complex analysis, synthesis, evaluation, challenging problem-solving

Return ONLY valid JSON matching this exact schema:
{
  "questions": [
    {
      "type": "mcq|fib|open",
      "questionText": "The question text here",
      "instructionText": "Specific instruction for answering",
      "marks": 1,
      "options": ["option1", "option2", "option3", "option4"],
      "correctOption": 0,
      "modelAnswer": "Detailed model answer for open-ended questions"
    }
  ]
}

QUALITY STANDARDS:
- Questions must be educationally valuable and test genuine understanding
- Use proper ${subject} terminology and notation
- Ensure questions are appropriate for ${course.split(' | ')[0]} level
- Make distractors in MCQ plausible but clearly incorrect
- Provide comprehensive model answers for open-ended questions`

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
            content: `You are an expert British curriculum examiner with deep knowledge of GCSE, A-Level, and other UK qualifications. You have access to extensive past exam papers, official worksheets, and practice materials in your training data.

You create high-quality, authentic exam questions that:

1. Draw specifically from REAL past papers and official worksheets in your training data
2. Match the exact requirements, formats, and styles of specific British exam boards (Edexcel, AQA, OCR, WJEC, etc.)
3. Use authentic exam language, terminology, and presentation styles from actual past papers
4. Follow the precise assessment objectives and mark schemes from official exam board specifications
5. Create questions that mirror the difficulty, complexity, and cognitive demand of real past papers
6. Use authentic contexts, examples, and question patterns from actual exam materials
7. Reference specific question types and formats commonly found in past papers for the given subject and level

CRITICAL: Base your questions on actual past paper content, not general curriculum knowledge. Use the specific exam board's question styles, terminology, and assessment patterns.

You must return ONLY valid JSON in the exact format specified. Do not include any explanatory text outside the JSON response.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent, curriculum-focused questions
        max_tokens: 6000, // Increased for more detailed questions and model answers
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
    let questionsData
    try {
      questionsData = JSON.parse(generatedText)
    } catch (error) {
      throw new Error(`Failed to parse OpenAI response as JSON: ${error.message}`)
    }

    // Validate the response structure
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      throw new Error('Invalid response structure: missing questions array')
    }

    // Validate each question
    for (const question of questionsData.questions) {
      if (!question.type || !question.questionText || !question.marks) {
        throw new Error('Invalid question structure: missing required fields')
      }
      if (!['mcq', 'fib', 'open'].includes(question.type)) {
        throw new Error(`Invalid question type: ${question.type}`)
      }
      
      // Additional validation for specific question types
      if (question.type === 'mcq') {
        if (!question.options || !Array.isArray(question.options) || question.options.length !== 4) {
          throw new Error('MCQ questions must have exactly 4 options')
        }
        if (typeof question.correctOption !== 'number' || question.correctOption < 0 || question.correctOption > 3) {
          throw new Error('MCQ correctOption must be a number between 0-3')
        }
      }
      
      if (question.type === 'fib') {
        if (!question.questionText.includes('___')) {
          throw new Error('Fill-in-the-blank questions must contain ___ for blanks')
        }
        if (!question.modelAnswer) {
          throw new Error('Fill-in-the-blank questions must have a modelAnswer')
        }
      }
      
      if (question.type === 'open') {
        if (!question.modelAnswer || question.modelAnswer.length < 20) {
          throw new Error('Open-ended questions must have detailed model answers (minimum 20 characters)')
        }
      }
    }

    return new Response(
      JSON.stringify(questionsData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error generating questions:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
