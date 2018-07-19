export interface AttributeId {
    attribute_id: number;
    value: number;
}

export interface EffectId {
    effect_id: number;
    is_default: boolean;
}

export interface Effect {
    effect_id: number;
    name?: string;
    display_name?: string;
    description?: string;
    icon_id?: number;
    effect_category?: number;
    pre_expression?: number;
    post_expression?: number;
    is_offensive?: boolean;
    is_assistance?: boolean;
    disallow_auto_repeat?: boolean;
    published?: boolean;
    is_warp_safe?: boolean;
    range_chance?: boolean;
    electronic_chance?: boolean;
    duration_attribute_id?: number;
    tracking_speed_attribute_id?: number;
    discharge_attribute_id?: number;
    range_attribute_id?: number;
    falloff_attribute_id?: number;
    modifiers?: EffectModifier[];
}

export interface EffectModifier {
    func: string;
    domain?: string;
    modified_attribute_id?: number;
    modifying_attribute_id?: number;
    effect_id?: number;
    operator?: number;
}
