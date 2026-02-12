-- Supabase Schema for Evangadi Forum
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with Supabase auth integration
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Questions policies
CREATE POLICY "Anyone can view questions" ON questions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create questions" ON questions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own questions" ON questions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions" ON questions
    FOR DELETE USING (auth.uid() = user_id);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    answer TEXT NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for answers
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Answers policies
CREATE POLICY "Anyone can view answers" ON answers
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create answers" ON answers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own answers" ON answers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own answers" ON answers
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS questions_user_id_idx ON questions(user_id);
CREATE INDEX IF NOT EXISTS questions_created_at_idx ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS answers_question_id_idx ON answers(question_id);
CREATE INDEX IF NOT EXISTS answers_user_id_idx ON answers(user_id);
CREATE INDEX IF NOT EXISTS answers_created_at_idx ON answers(created_at DESC);

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name, username)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'last_name', ''),
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
