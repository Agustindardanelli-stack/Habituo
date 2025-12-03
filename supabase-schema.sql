-- ============================================
-- LIFESYNC AI - ESQUEMA DE BASE DE DATOS
-- Para usar en Supabase SQL Editor
-- ============================================

-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: USERS (extendida de auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'pro')),
    timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
    currency TEXT DEFAULT 'ARS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trigger para crear profile al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- MÓDULO: FINANZAS
-- ============================================

-- Categorías de gastos
CREATE TABLE public.expense_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '💰',
    color TEXT DEFAULT '#10b981',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transacciones
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    category_name TEXT, -- Respaldo si se borra categoría
    category_confidence DECIMAL(3, 2), -- Confianza de IA (0-1)
    transaction_type TEXT DEFAULT 'expense' CHECK (transaction_type IN ('expense', 'income')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para transacciones
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_category ON public.transactions(category_id);

-- RLS para transacciones
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- MÓDULO: HÁBITOS
-- ============================================

-- Hábitos
CREATE TABLE public.habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🎯',
    color TEXT DEFAULT '#7c3aed',
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'weekly', 'custom')),
    custom_days INTEGER[], -- [0-6] para días personalizados (0=domingo)
    reminder_time TIME,
    reminder_enabled BOOLEAN DEFAULT FALSE,
    target_count INTEGER DEFAULT 1, -- Veces al día
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registros de hábitos completados
CREATE TABLE public.habit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    count INTEGER DEFAULT 1, -- Veces completado ese día
    notes TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Índices
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX idx_habit_logs_date ON public.habit_logs(date);
CREATE UNIQUE INDEX idx_habit_logs_unique ON public.habit_logs(habit_id, date);

-- RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own habits" ON public.habits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own habit_logs" ON public.habit_logs
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- MÓDULO: SALUD / CICLO MENSTRUAL
-- ============================================

-- Registros de ciclo
CREATE TABLE public.cycle_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    flow_intensity TEXT CHECK (flow_intensity IN ('light', 'medium', 'heavy', 'spotting')),
    is_period_start BOOLEAN DEFAULT FALSE,
    symptoms TEXT[], -- Array de síntomas
    mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predicciones de ciclo
CREATE TABLE public.cycle_predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    predicted_start DATE NOT NULL,
    predicted_end DATE NOT NULL,
    cycle_length INTEGER,
    period_length INTEGER,
    fertility_window_start DATE,
    fertility_window_end DATE,
    ovulation_date DATE,
    confidence DECIMAL(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_cycle_logs_user_date ON public.cycle_logs(user_id, date);
CREATE INDEX idx_cycle_predictions_user ON public.cycle_predictions(user_id);

-- RLS
ALTER TABLE public.cycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own cycle_logs" ON public.cycle_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own cycle_predictions" ON public.cycle_predictions
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- MÓDULO: DIARIO
-- ============================================

-- Entradas de diario
CREATE TABLE public.journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
    mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    sentiment_score DECIMAL(3, 2), -- -1 a 1
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    word_count INTEGER,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompts de reflexión
CREATE TABLE public.journal_prompts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_text TEXT NOT NULL,
    category TEXT CHECK (category IN ('gratitude', 'reflection', 'goals', 'emotions', 'creativity')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_journal_entries_user_date ON public.journal_entries(user_id, date);

-- RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own journal_entries" ON public.journal_entries
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- MÓDULO: CHAT IA
-- ============================================

-- Conversaciones con IA
CREATE TABLE public.ai_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mensajes de chat
CREATE TABLE public.ai_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ai_messages_conversation ON public.ai_messages(conversation_id);

-- RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own ai_conversations" ON public.ai_conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own ai_messages" ON public.ai_messages
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INSERTAR CATEGORÍAS POR DEFECTO
-- ============================================

-- Nota: Esto se ejecuta para cada usuario nuevo con un trigger
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.expense_categories (user_id, name, icon, color, is_default) VALUES
        (NEW.id, 'Alimentación', '🍽️', '#10b981', TRUE),
        (NEW.id, 'Transporte', '🚗', '#3b82f6', TRUE),
        (NEW.id, 'Servicios', '⚡', '#eab308', TRUE),
        (NEW.id, 'Entretenimiento', '🎬', '#8b5cf6', TRUE),
        (NEW.id, 'Salud', '🏥', '#ec4899', TRUE),
        (NEW.id, 'Ropa', '👔', '#6366f1', TRUE),
        (NEW.id, 'Hogar', '🏠', '#f97316', TRUE),
        (NEW.id, 'Educación', '📚', '#06b6d4', TRUE),
        (NEW.id, 'Otros', '📦', '#6b7280', TRUE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.create_default_categories();

-- ============================================
-- INSERTAR PROMPTS DE DIARIO
-- ============================================
INSERT INTO public.journal_prompts (prompt_text, category) VALUES
    ('¿Qué 3 cosas te hacen sentir agradecido/a hoy?', 'gratitude'),
    ('¿Cuál fue el mejor momento de tu día?', 'reflection'),
    ('¿Qué aprendiste hoy?', 'reflection'),
    ('¿Cómo te sentís en este momento y por qué?', 'emotions'),
    ('¿Qué te gustaría lograr mañana?', 'goals'),
    ('Describe un desafío que enfrentaste y cómo lo manejaste', 'reflection'),
    ('¿Qué te hizo sonreír hoy?', 'gratitude'),
    ('Si pudieras cambiar algo de hoy, ¿qué sería?', 'reflection'),
    ('¿Qué estás postergando y por qué?', 'goals'),
    ('Escribí una carta a tu yo del futuro', 'creativity');

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de resumen mensual de gastos
CREATE OR REPLACE VIEW public.monthly_expense_summary AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    category_name,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count,
    AVG(amount) as avg_amount
FROM public.transactions
WHERE transaction_type = 'expense'
GROUP BY user_id, DATE_TRUNC('month', date), category_name
ORDER BY month DESC, total_amount DESC;

-- Vista de rachas de hábitos
CREATE OR REPLACE VIEW public.habit_streaks AS
SELECT 
    h.id as habit_id,
    h.user_id,
    h.name,
    COUNT(DISTINCT hl.date) as total_completions,
    MAX(hl.date) as last_completed
FROM public.habits h
LEFT JOIN public.habit_logs hl ON h.id = hl.habit_id
GROUP BY h.id, h.user_id, h.name;

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================
