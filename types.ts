
export enum AppStep {
  FileUpload,
  Mapping,
  Preview,
}

export enum StandardColumn {
  UniqueKey = '一意キー',
  Risk = 'リスク',
  Control = 'コントロール',
  AuditProcedure = '監査手続',
  SampleSize = 'サンプル件数',
  PreviousAssessmentResult = '前回の評価結果',
}

export enum TransformationType {
    DIRECT = 'DIRECT',
    JOIN = 'JOIN',
    SPLIT = 'SPLIT',
    // Add more complex transformation types here if needed
}

export interface MappingRule {
  target: StandardColumn;
  source: string[];
  transformation: {
    type: TransformationType;
    details: string; // e.g., separator for JOIN, or regex for SPLIT
  };
  reasoning: string;
}

export type TransformationPlan = MappingRule[];

export type RcmData = Record<string, any>[];

export interface Template {
    id: string;
    name: string;
    plan: TransformationPlan;
}
