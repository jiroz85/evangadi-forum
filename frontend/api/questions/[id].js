const supabase = require('../../utils/supabase');
const cors = require('../../utils/cors');

module.exports = async (req, res) => {
  // Apply CORS middleware
  cors(req, res, () => {});

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', 'https://evangadi-forum-beige.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const questionId = req.query.id;

    // Get question
    const { data: questions, error: questionError } = await supabase
      .from('questions')
      .select('id, title, description, created_at, users(username)')
      .eq('id', questionId)
      .single();

    if (questionError || !questions) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Get answers
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('id, answer, created_at, users(username)')
      .eq('question_id', questionId)
      .order('created_at', { ascending: true });

    if (answersError) throw answersError;

    // Transform data to match expected format
    const formattedQuestion = {
      id: questions.id,
      title: questions.title,
      description: questions.description,
      created_at: questions.created_at,
      username: questions.users.username
    };

    const formattedAnswers = answers.map(a => ({
      id: a.id,
      answer: a.answer,
      created_at: a.created_at,
      username: a.users.username
    }));

    res.json({
      question: formattedQuestion,
      answers: formattedAnswers
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
