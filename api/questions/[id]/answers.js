const supabase = require('../../../utils/supabase');
const { authenticateToken } = require('../../../utils/auth');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { answer } = req.body;
    const questionId = req.query.id;
    const userId = req.user.userId;

    if (!answer) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    // Check if question exists
    const { data: questions, error: questionError } = await supabase
      .from('questions')
      .select('id')
      .eq('id', questionId)
      .single();

    if (questionError || !questions) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Create answer
    const { data, error } = await supabase
      .from('answers')
      .insert([{
        answer: answer,
        question_id: questionId,
        user_id: userId
      }])
      .select();

    if (error) throw error;

    res.status(201).json({ message: 'Answer posted successfully', answerId: data[0].id });
  } catch (error) {
    console.error('Post answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
