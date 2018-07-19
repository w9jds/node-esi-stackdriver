
export interface SkillQueueItem {
    skill_id: number;
    finish_date?: string;
    start_date?: string;
    finished_level: number;
    queue_position: number;
    training_start_sp?: number;
    level_end_sp?: number;
    level_start_sp?: number;
}

export interface SkillsOverview {
    skills: Skill[];
    total_sp: number;
    unallocated_sp?: number;
}

export interface Skill {
    skill_id: number;
    skillpoints_in_skill: number;
    trained_skill_level: number;
    active_skill_level: number;
}