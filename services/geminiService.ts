import { GoogleGenAI, Type } from "@google/genai";
import { RcmData, TransformationPlan, Template, StandardColumn, TransformationType } from '../types';
import { STANDARD_COLUMNS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const MAPPING_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        reasoning: {
            type: Type.STRING,
            description: "分析の概要と、特定のテンプレートや戦略を選択した理由についての日本語での説明。"
        },
        plan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    target: { type: Type.STRING, enum: STANDARD_COLUMNS },
                    source: { type: Type.ARRAY, items: { type: Type.STRING } },
                    transformation: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, enum: Object.values(TransformationType) },
                            details: { type: Type.STRING }
                        }
                    },
                    reasoning: { 
                        type: Type.STRING,
                        description: "この特定のマッピングを選択した理由についての日本語での簡単な説明。"
                    }
                },
                required: ["target", "source", "transformation", "reasoning"],
            },
        },
    },
    required: ["reasoning", "plan"],
};

export const analyzeRcmFile = async (data: RcmData, headers: string[], templates: Template[]): Promise<{ plan: TransformationPlan, reasoning: string }> => {
    const dataSample = data.slice(0, 5); // Use a sample of the data

    const prompt = `
あなたはJ-SOX RCM（リスク・コントロール・マトリックス）分析を専門とするエキスパートAIエージェントです。あなたのタスクは、与えられたRCMファイルの構造を分析し、その列を標準化されたフォーマットにマッピングする計画を提案することです。

**重要：応答内の 'reasoning' フィールドはすべて日本語で記述してください。**

**標準ターゲット列:**
${STANDARD_COLUMNS.join(', ')}

**あなたのタスク:**
1.  提供されたファイルのヘッダーとデータサンプルを分析します。
2.  既存の「変換テンプレート」を確認し、最も類似したものを見つけます。それをマッピングの参考にしますが、現在のファイルに合わせて調整してください。列名がわずかに異なる場合があることに注意してください（例：「リスク内容」対「Risk Description」）。
3.  各標準ターゲット列について、入力ファイルから最適なソース列を特定します。
4.  複数のソース列のデータを結合する必要がある場合は、「JOIN」変換を提案します。
5.  単一のソース列内のデータを分割する必要がある場合（例：1つのセルに監査手続とサンプル数がある場合）は、「SPLIT」変換を提案します。
6.  直接マッピングの場合は、「DIRECT」を使用します。
7.  各マッピング決定について、**日本語で**簡単な理由を記述します。
8.  全体的な分析戦略の概要を**日本語で**記述します。

**入力ファイルヘッダー:**
${headers.join(', ')}

**入力データサンプル（最初の5行）:**
${JSON.stringify(dataSample, null, 2)}

**既存の変換テンプレート（参考用）:**
${templates.length > 0 ? JSON.stringify(templates, null, 2) : "既存のテンプレートはありません。"}

この情報に基づいて、完全な変換計画を生成してください。提供されたスキーマに準拠したJSONオブジェクトのみで応答してください。
`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: MAPPING_RESPONSE_SCHEMA,
        },
    });

    const jsonText = response.text.trim();
    try {
        const parsed = JSON.parse(jsonText);
        return parsed;
    } catch (e) {
        console.error("Failed to parse AI response JSON:", jsonText);
        throw new Error("Received an invalid JSON response from the AI.");
    }
};

const TRANSFORM_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        data: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: STANDARD_COLUMNS.reduce((acc, col) => {
                    acc[col] = { type: Type.STRING };
                    return acc;
                }, {} as Record<string, { type: Type }>)
            }
        }
    },
    required: ["data"],
};


export const applyTransformations = async (data: RcmData, plan: TransformationPlan): Promise<RcmData> => {
    const prompt = `
You are a data transformation AI. Your task is to apply a set of rules to raw RCM data and generate a transformed dataset in a standardized format.

**Transformation Plan:**
${JSON.stringify(plan, null, 2)}

**Raw Data:**
${JSON.stringify(data, null, 2)}

**Instructions:**
For each row in the raw data, apply the rules in the transformation plan to generate a new row in the standardized format.
- **DIRECT:** Copy the value from the source column.
- **JOIN:** Combine values from the source columns. Use the 'details' field as a separator.
- **SPLIT:** Extract information from the source column. The 'details' field describes what to extract for the target.
- If a source column doesn't exist or is empty for a row, leave the target field as an empty string.
- The output must be an array of objects, where each object is a transformed row.

Respond ONLY with a JSON object that adheres to the provided schema.
`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: TRANSFORM_RESPONSE_SCHEMA,
        },
    });

    const jsonText = response.text.trim();
    try {
        const parsed = JSON.parse(jsonText);
        return parsed.data || [];
    } catch (e) {
        console.error("Failed to parse AI response JSON for transformation:", jsonText);
        throw new Error("Received an invalid JSON response from the AI during transformation.");
    }
};