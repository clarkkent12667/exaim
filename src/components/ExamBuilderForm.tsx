import React, { useState, useEffect } from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';

interface ExamFormData {
  name: string;
  qualification: string;
  board: string;
  subject: string;
  course: string;
  topic?: string;
  sub_topic?: string;
  difficulty: string;
}

interface ExamBuilderFormProps {
  register: UseFormRegister<ExamFormData>;
  errors: FieldErrors<ExamFormData>;
  watch: UseFormWatch<ExamFormData>;
  setValue: (name: keyof ExamFormData, value: any) => void;
}

const ExamBuilderForm: React.FC<ExamBuilderFormProps> = ({ register, errors, watch, setValue }) => {
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [availableSubtopics, setAvailableSubtopics] = useState<string[]>([]);
  
  // Watch form values for dynamic updates
  const watchedSubject = watch('subject');
  const watchedTopic = watch('topic');
  
  // British Curriculum Options
  const qualifications = [
    'GCSE',
    'IGCSE', 
    'AS Level',
    'A Level',
    'BTEC',
    'Scottish Highers',
    'Scottish Advanced Highers',
    'IB (International Baccalaureate)',
    'Cambridge Pre-U',
    'Other'
  ];
  
  const boards = [
    'Edexcel (Pearson)',
    'AQA',
    'OCR',
    'WJEC',
    'CCEA',
    'Cambridge International',
    'SQA (Scottish Qualifications Authority)',
    'IBO (International Baccalaureate Organization)',
    'Other'
  ];
  
  const subjects = [
    'Mathematics',
    'English Language',
    'English Literature',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Economics',
    'Business Studies',
    'Computer Science',
    'Psychology',
    'Sociology',
    'Art & Design',
    'Design & Technology',
    'French',
    'Spanish',
    'German',
    'Music',
    'Physical Education',
    'Religious Studies',
    'Other'
  ];
  
  // Topic and subtopic mappings for common subjects
  const getTopicsForSubject = (subject: string) => {
    const topicMap: { [key: string]: string[] } = {
      'Mathematics': [
        'Number',
        'Algebra',
        'Geometry',
        'Statistics',
        'Probability',
        'Trigonometry',
        'Calculus',
        'Mechanics'
      ],
      'Physics': [
        'Forces and Motion',
        'Electricity',
        'Waves',
        'Energy',
        'Particle Model',
        'Atomic Structure',
        'Space Physics',
        'Thermodynamics'
      ],
      'Chemistry': [
        'Atomic Structure',
        'Bonding',
        'Periodic Table',
        'Chemical Calculations',
        'Organic Chemistry',
        'Energetics',
        'Kinetics',
        'Equilibrium'
      ],
      'Biology': [
        'Cell Biology',
        'Genetics',
        'Evolution',
        'Ecology',
        'Human Biology',
        'Plant Biology',
        'Biochemistry',
        'Microbiology'
      ],
      'English Language': [
        'Reading Comprehension',
        'Creative Writing',
        'Transactional Writing',
        'Language Analysis',
        'Spoken Language',
        'Grammar',
        'Vocabulary'
      ],
      'English Literature': [
        'Poetry',
        'Prose',
        'Drama',
        'Shakespeare',
        'Modern Literature',
        'Literary Analysis',
        'Context and Themes'
      ]
    };
    return topicMap[subject] || [];
  };
  
  const getSubtopicsForTopic = (topic: string) => {
    const subtopicMap: { [key: string]: string[] } = {
      'Number': ['Fractions', 'Decimals', 'Percentages', 'Ratio', 'Indices', 'Surds'],
      'Algebra': ['Linear Equations', 'Quadratic Equations', 'Simultaneous Equations', 'Inequalities', 'Graphs'],
      'Geometry': ['Angles', 'Triangles', 'Circles', 'Polygons', 'Transformations', 'Constructions'],
      'Statistics': ['Data Collection', 'Mean, Median, Mode', 'Range', 'Frequency Tables', 'Histograms'],
      'Probability': ['Basic Probability', 'Tree Diagrams', 'Conditional Probability', 'Expected Value'],
      'Trigonometry': ['Sine, Cosine, Tangent', 'Pythagoras Theorem', 'Trigonometric Identities', 'Sine/Cosine Rules'],
      'Calculus': ['Differentiation', 'Integration', 'Limits', 'Derivatives', 'Applications'],
      'Mechanics': ['Kinematics', 'Dynamics', 'Forces', 'Energy', 'Momentum'],
      
      'Forces and Motion': ['Newton\'s Laws', 'Momentum', 'Projectiles', 'Circular Motion', 'Simple Harmonic Motion'],
      'Electricity': ['Current', 'Voltage', 'Resistance', 'Circuits', 'Electromagnetic Induction'],
      'Waves': ['Wave Properties', 'Sound Waves', 'Light Waves', 'Reflection', 'Refraction'],
      'Energy': ['Kinetic Energy', 'Potential Energy', 'Conservation of Energy', 'Work Done', 'Power'],
      'Particle Model': ['States of Matter', 'Gas Laws', 'Kinetic Theory', 'Pressure'],
      'Atomic Structure': ['Electron Configuration', 'Ionisation Energy', 'Atomic Radius', 'Isotopes'],
      'Space Physics': ['Solar System', 'Stars', 'Galaxies', 'Big Bang Theory'],
      'Thermodynamics': ['Heat Transfer', 'Temperature', 'Specific Heat', 'Thermal Expansion'],
      
      'Bonding': ['Ionic Bonding', 'Covalent Bonding', 'Metallic Bonding', 'Intermolecular Forces'],
      'Periodic Table': ['Groups and Periods', 'Trends', 'Transition Metals', 'Noble Gases'],
      'Chemical Calculations': ['Moles', 'Concentration', 'Percentage Composition', 'Empirical Formula'],
      'Organic Chemistry': ['Alkanes', 'Alkenes', 'Alcohols', 'Carboxylic Acids', 'Polymers'],
      'Energetics': ['Enthalpy Changes', 'Hess\'s Law', 'Bond Enthalpies', 'Calorimetry'],
      'Kinetics': ['Rate of Reaction', 'Catalysts', 'Temperature Effects', 'Concentration Effects'],
      'Equilibrium': ['Dynamic Equilibrium', 'Le Chatelier\'s Principle', 'Kc Calculations'],
      
      'Genetics': ['DNA Structure', 'Protein Synthesis', 'Inheritance', 'Genetic Engineering', 'Evolution'],
      'Evolution': ['Natural Selection', 'Speciation', 'Evidence for Evolution', 'Human Evolution'],
      'Ecology': ['Ecosystems', 'Food Chains', 'Nutrient Cycles', 'Biodiversity', 'Conservation'],
      'Human Biology': ['Digestive System', 'Circulatory System', 'Respiratory System', 'Nervous System'],
      'Plant Biology': ['Photosynthesis', 'Plant Structure', 'Transport in Plants', 'Plant Hormones'],
      'Biochemistry': ['Enzymes', 'Metabolism', 'Respiration', 'Photosynthesis', 'Biomolecules'],
      'Microbiology': ['Bacteria', 'Viruses', 'Fungi', 'Antibiotics', 'Immune System'],
      
      'Reading Comprehension': ['Text Analysis', 'Inference', 'Summarizing', 'Critical Thinking'],
      'Creative Writing': ['Narrative Writing', 'Descriptive Writing', 'Character Development', 'Plot Structure'],
      'Transactional Writing': ['Letters', 'Reports', 'Articles', 'Speeches', 'Reviews'],
      'Language Analysis': ['Language Techniques', 'Tone', 'Purpose', 'Audience', 'Context'],
      'Spoken Language': ['Presentation Skills', 'Debate', 'Discussion', 'Interview Techniques'],
      'Grammar': ['Sentence Structure', 'Punctuation', 'Tenses', 'Parts of Speech'],
      'Vocabulary': ['Word Meanings', 'Synonyms', 'Antonyms', 'Context Clues', 'Word Origins'],
      
      'Poetry': ['Poetic Devices', 'Rhythm and Rhyme', 'Imagery', 'Themes', 'Analysis'],
      'Prose': ['Novel Analysis', 'Short Stories', 'Character Development', 'Narrative Techniques'],
      'Drama': ['Play Analysis', 'Character Motivation', 'Stage Directions', 'Themes'],
      'Shakespeare': ['Language Analysis', 'Character Study', 'Themes', 'Historical Context'],
      'Modern Literature': ['Contemporary Themes', 'Literary Movements', 'Author\'s Purpose'],
      'Literary Analysis': ['Critical Analysis', 'Literary Criticism', 'Comparative Analysis'],
      'Context and Themes': ['Historical Context', 'Social Context', 'Cultural Themes', 'Universal Themes']
    };
    return subtopicMap[topic] || [];
  };
  
  // Update topics when subject changes and auto-generate course
  useEffect(() => {
    if (watchedSubject) {
      const topics = getTopicsForSubject(watchedSubject);
      setAvailableTopics(topics);
      setAvailableSubtopics([]); // Reset subtopics
      
      // Auto-generate course
      const qualification = watch('qualification');
      const board = watch('board');
      if (qualification && board && watchedSubject) {
        const courseValue = `${qualification} | ${board} | ${watchedSubject}`;
        setValue('course', courseValue);
      }
    } else {
      setAvailableTopics([]);
      setAvailableSubtopics([]);
    }
  }, [watchedSubject, watch, setValue]);
  
  // Update subtopics when topic changes
  useEffect(() => {
    if (watchedTopic) {
      const subtopics = getSubtopicsForTopic(watchedTopic);
      setAvailableSubtopics(subtopics);
    } else {
      setAvailableSubtopics([]);
    }
  }, [watchedTopic]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Exam Name */}
      <div className="md:col-span-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Exam Name *
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter exam name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Qualification */}
      <div>
        <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">
          Qualification *
        </label>
        <select
          id="qualification"
          {...register('qualification')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select qualification</option>
          {qualifications.map(qual => (
            <option key={qual} value={qual}>{qual}</option>
          ))}
        </select>
        {errors.qualification && (
          <p className="mt-1 text-sm text-red-600">{errors.qualification.message}</p>
        )}
      </div>

      {/* Board */}
      <div>
        <label htmlFor="board" className="block text-sm font-medium text-gray-700 mb-2">
          Exam Board *
        </label>
        <select
          id="board"
          {...register('board')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select board</option>
          {boards.map(board => (
            <option key={board} value={board}>{board}</option>
          ))}
        </select>
        {errors.board && (
          <p className="mt-1 text-sm text-red-600">{errors.board.message}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Subject *
        </label>
        <select
          id="subject"
          {...register('subject')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select subject</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      {/* Course */}
      <div>
        <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
          Course *
        </label>
        <input
          type="text"
          id="course"
          {...register('course')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          placeholder="Auto-generated from selections"
          readOnly
        />
        {errors.course && (
          <p className="mt-1 text-sm text-red-600">{errors.course.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Auto-generated format: Qualification | Exam Board | Subject (e.g., GCSE | Edexcel | Chemistry)
        </p>
      </div>

      {/* Topic */}
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
          Topic (Optional)
        </label>
        <select
          id="topic"
          {...register('topic')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={!watchedSubject}
        >
          <option value="">Select topic (optional)</option>
          {availableTopics.map(topic => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
        {errors.topic && (
          <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p>
        )}
        {!watchedSubject && (
          <p className="mt-1 text-sm text-gray-500">Please select a subject first</p>
        )}
      </div>

      {/* Sub-topic */}
      <div>
        <label htmlFor="sub_topic" className="block text-sm font-medium text-gray-700 mb-2">
          Sub-topic (Optional)
        </label>
        <select
          id="sub_topic"
          {...register('sub_topic')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={!watchedTopic || availableSubtopics.length === 0}
        >
          <option value="">Select sub-topic (optional)</option>
          {availableSubtopics.map(subtopic => (
            <option key={subtopic} value={subtopic}>{subtopic}</option>
          ))}
        </select>
        {errors.sub_topic && (
          <p className="mt-1 text-sm text-red-600">{errors.sub_topic.message}</p>
        )}
        {!watchedTopic && (
          <p className="mt-1 text-sm text-gray-500">Please select a topic first</p>
        )}
        {watchedTopic && availableSubtopics.length === 0 && (
          <p className="mt-1 text-sm text-gray-500">No subtopics available for this topic</p>
        )}
      </div>

      {/* Difficulty */}
      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty Level *
        </label>
        <select
          id="difficulty"
          {...register('difficulty')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select difficulty</option>
          {difficulties.map(diff => (
            <option key={diff} value={diff}>{diff}</option>
          ))}
        </select>
        {errors.difficulty && (
          <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
        )}
      </div>
    </div>
  );
};

export default ExamBuilderForm;
