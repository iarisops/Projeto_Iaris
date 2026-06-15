-- IARIS Portfolio OS — RLS Policies and Triggers
-- T010: (a) RLS on all tables — authenticated users only
--        (b) trigger update_startup_last_update_at on portfolio_startups

-- ============================================================
-- SECTION 1: Enable RLS on all tables
-- ============================================================

ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnels                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_stages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_candidates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_startups     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualitative_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panel_evaluation_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panel_evaluations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_criteria    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okrs                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rituals                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_activities   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_versions       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECTION 2: RLS Policies — authenticated users access all rows
-- ============================================================

CREATE POLICY "auth_users_all" ON public.users
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.funnels
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.funnel_stages
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.startup_candidates
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.portfolio_startups
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.qualitative_assessments
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.panel_evaluation_forms
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.panel_evaluations
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.crm_activities
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.operational_assessments
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.assessment_items
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- assessment_criteria is read-only reference data; all authenticated users can read, only service role writes
CREATE POLICY "auth_users_read" ON public.assessment_criteria
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.okrs
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.metrics
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.action_plans
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.kanban_tasks
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.rituals
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.documents
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.portfolio_activities
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.ai_jobs
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_all" ON public.context_versions
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- SECTION 3: updated_at auto-update trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_funnels_updated_at
  BEFORE UPDATE ON public.funnels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_funnel_stages_updated_at
  BEFORE UPDATE ON public.funnel_stages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_startup_candidates_updated_at
  BEFORE UPDATE ON public.startup_candidates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_portfolio_startups_updated_at
  BEFORE UPDATE ON public.portfolio_startups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_qualitative_assessments_updated_at
  BEFORE UPDATE ON public.qualitative_assessments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_panel_evaluation_forms_updated_at
  BEFORE UPDATE ON public.panel_evaluation_forms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_panel_evaluations_updated_at
  BEFORE UPDATE ON public.panel_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_crm_activities_updated_at
  BEFORE UPDATE ON public.crm_activities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_operational_assessments_updated_at
  BEFORE UPDATE ON public.operational_assessments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_assessment_items_updated_at
  BEFORE UPDATE ON public.assessment_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_okrs_updated_at
  BEFORE UPDATE ON public.okrs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_metrics_updated_at
  BEFORE UPDATE ON public.metrics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_action_plans_updated_at
  BEFORE UPDATE ON public.action_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_kanban_tasks_updated_at
  BEFORE UPDATE ON public.kanban_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_rituals_updated_at
  BEFORE UPDATE ON public.rituals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_portfolio_activities_updated_at
  BEFORE UPDATE ON public.portfolio_activities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- SECTION 4: portfolio_startups.last_update_at trigger
-- ============================================================

-- For tables with direct startup_id column
CREATE OR REPLACE FUNCTION public.touch_startup_last_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.portfolio_startups
  SET last_update_at = now()
  WHERE id = NEW.startup_id;
  RETURN NEW;
END;
$$;

-- For assessment_items (no startup_id — must join through operational_assessments)
CREATE OR REPLACE FUNCTION public.touch_startup_last_update_via_assessment()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_startup_id UUID;
BEGIN
  SELECT startup_id INTO v_startup_id
  FROM public.operational_assessments
  WHERE id = NEW.assessment_id;

  IF v_startup_id IS NOT NULL THEN
    UPDATE public.portfolio_startups
    SET last_update_at = now()
    WHERE id = v_startup_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_assessment_items_touch_startup
  AFTER INSERT OR UPDATE ON public.assessment_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_startup_last_update_via_assessment();

CREATE TRIGGER trg_okrs_touch_startup
  AFTER INSERT OR UPDATE ON public.okrs
  FOR EACH ROW EXECUTE FUNCTION public.touch_startup_last_update();

CREATE TRIGGER trg_metrics_touch_startup
  AFTER INSERT OR UPDATE ON public.metrics
  FOR EACH ROW EXECUTE FUNCTION public.touch_startup_last_update();

CREATE TRIGGER trg_action_plans_touch_startup
  AFTER INSERT OR UPDATE ON public.action_plans
  FOR EACH ROW EXECUTE FUNCTION public.touch_startup_last_update();

CREATE TRIGGER trg_kanban_tasks_touch_startup
  AFTER INSERT OR UPDATE ON public.kanban_tasks
  FOR EACH ROW EXECUTE FUNCTION public.touch_startup_last_update();

CREATE TRIGGER trg_rituals_touch_startup
  AFTER INSERT OR UPDATE ON public.rituals
  FOR EACH ROW EXECUTE FUNCTION public.touch_startup_last_update();

CREATE TRIGGER trg_documents_touch_startup
  AFTER INSERT OR UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.touch_startup_last_update();

CREATE TRIGGER trg_portfolio_activities_touch_startup
  AFTER INSERT OR UPDATE ON public.portfolio_activities
  FOR EACH ROW EXECUTE FUNCTION public.touch_startup_last_update();

CREATE TRIGGER trg_context_versions_touch_startup
  AFTER INSERT OR UPDATE ON public.context_versions
  FOR EACH ROW EXECUTE FUNCTION public.touch_startup_last_update();
