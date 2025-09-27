import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  User, 
  Heart, 
  Activity, 
  Pill, 
  Stethoscope, 
  Calendar,
  Info,
  AlertCircle,
  Upload,
  Loader2
} from 'lucide-react';

interface DocumentInfo {
  report_type?: string;
  facility?: string;
  department?: string;
  physician?: string;
  report_date?: string;
  patient_id?: string;
  "Report Type"?: string;
  "Facility"?: string;
  "Department"?: string;
  "Physician"?: string;
  "Report Date"?: string;
  "Patient ID"?: string;
}

interface VitalSigns {
  blood_pressure_systolic?: string | number;
  blood_pressure_diastolic?: string | number;
  heart_rate?: string | number;
  temperature?: string | number;
  weight?: string | number;
  height?: string | number;
  bmi?: string | number;
  "Blood Pressure Systolic"?: string | number;
  "Blood Pressure Diastolic"?: string | number;
  "Heart Rate"?: string | number;
  "Temperature"?: string | number;
  "Weight"?: string | number;
  "Height"?: string | number;
  "BMI"?: string | number;
}

interface LabResults {
  glucose_fasting?: string | number;
  glucose_random?: string | number;
  hba1c?: string | number;
  creatinine?: string | number;
  bun?: string | number;
  cholesterol_total?: string | number;
  cholesterol_hdl?: string | number;
  cholesterol_ldl?: string | number;
  triglycerides?: string | number;
  hemoglobin?: string | number;
  hematocrit?: string | number;
  wbc_count?: string | number;
  platelet_count?: string | number;
  "Glucose (Fasting)"?: string | number;
  "Glucose (Random)"?: string | number;
  "HbA1c"?: string | number;
  "Creatinine"?: string | number;
  "BUN"?: string | number;
  "Total Cholesterol"?: string | number;
  "HDL Cholesterol"?: string | number;
  "LDL Cholesterol"?: string | number;
  "Triglycerides"?: string | number;
  "Hemoglobin"?: string | number;
  "Hematocrit"?: string | number;
  "WBC Count"?: string | number;
  "Platelet Count"?: string | number;
}

interface Allergy {
  allergen?: string;
  severity?: string;
  reaction?: string;
}

interface Procedure {
  name?: string;
  date?: string;
  status?: string;
}

interface ExtractedMedicalData {
  "Additional Information"?: {
    "Document Info"?: DocumentInfo;
    "Vital Signs"?: VitalSigns;
    "Laboratory Results"?: LabResults;
  };
  "Allergies"?: string[] | Allergy[] | string;
  "Procedures"?: string[] | Procedure[] | string;
  "Imaging Results"?: any;
  "Clinical Notes"?: string;
  "Recommendations"?: string[];
  "Follow-Up"?: string | any;
  "Additional Findings"?: string | any;
}

const ExtractedData: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ExtractedMedicalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError("Please upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/llm-extraction", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "An error occurred.");
        setLoading(false);
        return;
      }

      const result = await response.json();
      setData(result.data["Extracted Medical Data"]);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  const formatValue = (value: any, unit: string = ''): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not available';
    }
    return unit ? `${value} ${unit}` : String(value);
  };

  const renderDocumentInfo = (docInfo: DocumentInfo) => {
    if (!docInfo) return <p className="text-gray-500">No document information available</p>;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Report Type:</span>
            <span>{formatValue(docInfo.report_type || docInfo["Report Type"])}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Facility:</span>
            <span>{formatValue(docInfo.facility || docInfo["Facility"])}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Department:</span>
            <span>{formatValue(docInfo.department || docInfo["Department"])}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Physician:</span>
            <span>{formatValue(docInfo.physician || docInfo["Physician"])}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Report Date:</span>
            <span>{formatValue(docInfo.report_date || docInfo["Report Date"])}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Patient ID:</span>
            <span>{formatValue(docInfo.patient_id || docInfo["Patient ID"])}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderVitalSigns = (vitals: VitalSigns) => {
    if (!vitals) return <p className="text-gray-500">No vital signs data available</p>;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="text-sm text-gray-600">Blood Pressure</div>
          <div className="text-xl font-semibold text-blue-600">
            {formatValue(vitals.blood_pressure_systolic || vitals["Blood Pressure Systolic"])}/
            {formatValue(vitals.blood_pressure_diastolic || vitals["Blood Pressure Diastolic"])} mmHg
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-green-50">
          <div className="text-sm text-gray-600">Heart Rate</div>
          <div className="text-xl font-semibold text-green-600">
            {formatValue(vitals.heart_rate || vitals["Heart Rate"], 'bpm')}
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-yellow-50">
          <div className="text-sm text-gray-600">Temperature</div>
          <div className="text-xl font-semibold text-yellow-600">
            {formatValue(vitals.temperature || vitals["Temperature"], '°F')}
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-purple-50">
          <div className="text-sm text-gray-600">Weight</div>
          <div className="text-xl font-semibold text-purple-600">
            {formatValue(vitals.weight || vitals["Weight"], 'kg')}
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-indigo-50">
          <div className="text-sm text-gray-600">Height</div>
          <div className="text-xl font-semibold text-indigo-600">
            {formatValue(vitals.height || vitals["Height"], 'cm')}
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-pink-50">
          <div className="text-sm text-gray-600">BMI</div>
          <div className="text-xl font-semibold text-pink-600">
            {formatValue(vitals.bmi || vitals["BMI"])}
          </div>
        </div>
      </div>
    );
  };

  const renderLabResults = (labResults: LabResults) => {
    if (!labResults) return <p className="text-gray-500">No laboratory results available</p>;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Blood Chemistry */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Blood Chemistry
          </h4>
          <div className="space-y-2">
            {[
              { key: 'glucose_fasting', alt: 'Glucose (Fasting)', unit: 'mg/dL' },
              { key: 'glucose_random', alt: 'Glucose (Random)', unit: 'mg/dL' },
              { key: 'hba1c', alt: 'HbA1c', unit: '%' },
              { key: 'creatinine', alt: 'Creatinine', unit: 'mg/dL' },
              { key: 'bun', alt: 'BUN', unit: 'mg/dL' }
            ].map(({ key, alt, unit }) => (
              <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{alt}</span>
                <span className="text-sm font-medium">{formatValue((labResults as any)[key] || (labResults as any)[alt], unit)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lipid Panel */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Lipid Panel
          </h4>
          <div className="space-y-2">
            {[
              { key: 'cholesterol_total', alt: 'Total Cholesterol', unit: 'mg/dL' },
              { key: 'cholesterol_hdl', alt: 'HDL Cholesterol', unit: 'mg/dL' },
              { key: 'cholesterol_ldl', alt: 'LDL Cholesterol', unit: 'mg/dL' },
              { key: 'triglycerides', alt: 'Triglycerides', unit: 'mg/dL' }
            ].map(({ key, alt, unit }) => (
              <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{alt}</span>
                <span className="text-sm font-medium">{formatValue((labResults as any)[key] || (labResults as any)[alt], unit)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Blood Count */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Complete Blood Count
          </h4>
          <div className="space-y-2">
            {[
              { key: 'hemoglobin', alt: 'Hemoglobin', unit: 'g/dL' },
              { key: 'hematocrit', alt: 'Hematocrit', unit: '%' },
              { key: 'wbc_count', alt: 'WBC Count', unit: '/μL' },
              { key: 'platelet_count', alt: 'Platelet Count', unit: '/μL' }
            ].map(({ key, alt, unit }) => (
              <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{alt}</span>
                <span className="text-sm font-medium">{formatValue((labResults as any)[key] || (labResults as any)[alt], unit)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAllergies = (allergies: string[] | Allergy[] | string) => {
    if (!allergies || (Array.isArray(allergies) && allergies.length === 0)) {
      return <p className="text-gray-500">No known allergies</p>;
    }
    
    const allergyList = Array.isArray(allergies) ? allergies : [allergies];
    
    return (
      <div className="space-y-2">
        {allergyList.map((allergy, index) => (
          <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-700">
                {typeof allergy === 'string' ? allergy : (allergy as Allergy).allergen || 'Unknown allergen'}
              </span>
              {typeof allergy === 'object' && (allergy as Allergy).severity && (
                <Badge variant={(allergy as Allergy).severity === 'severe' ? 'destructive' : 'secondary'}>
                  {(allergy as Allergy).severity}
                </Badge>
              )}
            </div>
            {typeof allergy === 'object' && (allergy as Allergy).reaction && (
              <p className="text-sm text-red-600 mt-1">Reaction: {(allergy as Allergy).reaction}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Medical Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !file}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  'Extract Data'
                )}
              </Button>
            </div>
          </form>
          
          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Extracted Data Display */}
      {data && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Extracted Medical Data
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Additional Information Section */}
          {data["Additional Information"] && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
              
              {/* Document Info */}
              {data["Additional Information"]["Document Info"] && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Document Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderDocumentInfo(data["Additional Information"]["Document Info"])}
                  </CardContent>
                </Card>
              )}

              {/* Vital Signs */}
              {data["Additional Information"]["Vital Signs"] && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Vital Signs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderVitalSigns(data["Additional Information"]["Vital Signs"])}
                  </CardContent>
                </Card>
              )}

              {/* Laboratory Results */}
              {data["Additional Information"]["Laboratory Results"] && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Laboratory Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderLabResults(data["Additional Information"]["Laboratory Results"])}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Allergies */}
          {data["Allergies"] && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderAllergies(data["Allergies"])}
              </CardContent>
            </Card>
          )}

          {/* Procedures */}
          {data["Procedures"] && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Procedures
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(data["Procedures"]) && data["Procedures"].length > 0 ? (
                  <div className="space-y-2">
                    {data["Procedures"].map((procedure, index) => (
                      <div key={index} className="p-3 bg-blue-50 border rounded-lg">
                        <div className="font-medium">
                          {typeof procedure === 'string' ? procedure : (procedure as Procedure).name || 'Unknown procedure'}
                        </div>
                        {typeof procedure === 'object' && (
                          <div className="text-sm text-gray-600 mt-1">
                            {(procedure as Procedure).date && <span>Date: {(procedure as Procedure).date} • </span>}
                            {(procedure as Procedure).status && <span>Status: {(procedure as Procedure).status}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No procedures found</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Clinical Notes */}
          {data["Clinical Notes"] && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Clinical Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                  {data["Clinical Notes"]}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {data["Recommendations"] && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(data["Recommendations"]) && data["Recommendations"].length > 0 ? (
                  <ul className="space-y-2">
                    {data["Recommendations"].map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No recommendations found</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Follow-Up */}
          {data["Follow-Up"] && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Follow-Up Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm bg-yellow-50 p-4 rounded-lg">
                  {typeof data["Follow-Up"] === 'string' ? data["Follow-Up"] : JSON.stringify(data["Follow-Up"], null, 2)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Findings */}
          {data["Additional Findings"] && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Additional Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm bg-gray-50 p-4 rounded-lg">
                  {typeof data["Additional Findings"] === 'string' ? data["Additional Findings"] : JSON.stringify(data["Additional Findings"], null, 2)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ExtractedData;
