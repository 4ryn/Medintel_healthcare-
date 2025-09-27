import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  FileText, 
  Heart, 
  Activity, 
  Pill, 
  Stethoscope, 
  Calendar, 
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  Copy,
  RefreshCw
} from 'lucide-react';

const MedicalDataExtraction = () => {
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/v1/llm-extraction', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract data from document');
      }

      const result = await response.json();
      setExtractedData(result.extracted_data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value, unit = '') => {
    if (value === null || value === undefined) return 'Not provided';
    return `${value}${unit ? ' ' + unit : ''}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadReport = () => {
    if (!extractedData) return;
    
    const report = JSON.stringify(extractedData, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-extraction-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Medical Data Extraction</h1>
        <p className="text-gray-600">Upload medical documents to automatically extract structured data using AI</p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </CardTitle>
          <CardDescription>
            Supported formats: PDF, JPG, PNG. Maximum file size: 10MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <span className="text-lg font-medium">
                {file ? file.name : 'Click to upload or drag and drop'}
              </span>
              <span className="text-sm text-gray-500">
                PDF, JPG, PNG up to 10MB
              </span>
            </label>
          </div>
          
          {loading && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Extracting data from document...</span>
            </div>
          )}
          
          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Extracted Data Display */}
      {extractedData && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button onClick={downloadReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button onClick={() => copyToClipboard(JSON.stringify(extractedData, null, 2))} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copy JSON
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="labs">Lab Results</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{formatValue(extractedData.patient_info?.name)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Patient ID:</span>
                      <span>{formatValue(extractedData.patient_info?.patient_id)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date of Birth:</span>
                      <span>{formatValue(extractedData.patient_info?.date_of_birth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Age:</span>
                      <span>{formatValue(extractedData.patient_info?.age, 'years')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Gender:</span>
                      <span>{formatValue(extractedData.patient_info?.gender)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Document Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Document Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Report Type:</span>
                      <span>{formatValue(extractedData.document_info?.report_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Facility:</span>
                      <span>{formatValue(extractedData.document_info?.facility)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Physician:</span>
                      <span>{formatValue(extractedData.document_info?.physician)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Report Date:</span>
                      <span>{formatValue(extractedData.document_info?.report_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Department:</span>
                      <span>{formatValue(extractedData.document_info?.department)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Quick Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {extractedData.vital_signs?.blood_pressure_systolic || '-'}/
                        {extractedData.vital_signs?.blood_pressure_diastolic || '-'}
                      </div>
                      <div className="text-sm text-gray-600">Blood Pressure</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {extractedData.vital_signs?.heart_rate || '-'}
                      </div>
                      <div className="text-sm text-gray-600">Heart Rate</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {extractedData.laboratory_results?.glucose_fasting || 
                         extractedData.laboratory_results?.glucose_random || '-'}
                      </div>
                      <div className="text-sm text-gray-600">Glucose</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {extractedData.medications?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Medications</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vital Signs Tab */}
            <TabsContent value="vitals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-gray-600">Blood Pressure</div>
                      <div className="text-xl font-semibold">
                        {formatValue(extractedData.vital_signs?.blood_pressure_systolic)}/
                        {formatValue(extractedData.vital_signs?.blood_pressure_diastolic)} mmHg
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-gray-600">Heart Rate</div>
                      <div className="text-xl font-semibold">
                        {formatValue(extractedData.vital_signs?.heart_rate, 'bpm')}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-gray-600">Temperature</div>
                      <div className="text-xl font-semibold">
                        {formatValue(extractedData.vital_signs?.temperature, '°F')}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-gray-600">Weight</div>
                      <div className="text-xl font-semibold">
                        {formatValue(extractedData.vital_signs?.weight, 'kg')}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-gray-600">Height</div>
                      <div className="text-xl font-semibold">
                        {formatValue(extractedData.vital_signs?.height, 'cm')}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-gray-600">BMI</div>
                      <div className="text-xl font-semibold">
                        {formatValue(extractedData.vital_signs?.bmi)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lab Results Tab */}
            <TabsContent value="labs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Laboratory Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Blood Chemistry */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Blood Chemistry</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>Glucose (Fasting)</span>
                          <span>{formatValue(extractedData.laboratory_results?.glucose_fasting, 'mg/dL')}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>HbA1c</span>
                          <span>{formatValue(extractedData.laboratory_results?.hba1c, '%')}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>Creatinine</span>
                          <span>{formatValue(extractedData.laboratory_results?.creatinine, 'mg/dL')}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>BUN</span>
                          <span>{formatValue(extractedData.laboratory_results?.bun, 'mg/dL')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lipid Panel */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Lipid Panel</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>Total Cholesterol</span>
                          <span>{formatValue(extractedData.laboratory_results?.cholesterol_total, 'mg/dL')}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>HDL Cholesterol</span>
                          <span>{formatValue(extractedData.laboratory_results?.cholesterol_hdl, 'mg/dL')}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>LDL Cholesterol</span>
                          <span>{formatValue(extractedData.laboratory_results?.cholesterol_ldl, 'mg/dL')}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>Triglycerides</span>
                          <span>{formatValue(extractedData.laboratory_results?.triglycerides, 'mg/dL')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Blood Count */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Complete Blood Count</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>Hemoglobin</span>
                          <span>{formatValue(extractedData.laboratory_results?.hemoglobin, 'g/dL')}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>Hematocrit</span>
                          <span>{formatValue(extractedData.laboratory_results?.hematocrit, '%')}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>WBC Count</span>
                          <span>{formatValue(extractedData.laboratory_results?.wbc_count, '/μL')}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>Platelet Count</span>
                          <span>{formatValue(extractedData.laboratory_results?.platelet_count, '/μL')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {extractedData.medications && extractedData.medications.length > 0 ? (
                    <div className="space-y-3">
                      {extractedData.medications.map((medication, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">
                                {typeof medication === 'string' ? medication : medication.name || 'Unknown Medication'}
                              </div>
                              {typeof medication === 'object' && (
                                <div className="text-sm text-gray-600 space-y-1">
                                  {medication.dosage && <div>Dosage: {medication.dosage}</div>}
                                  {medication.frequency && <div>Frequency: {medication.frequency}</div>}
                                  {medication.route && <div>Route: {medication.route}</div>}
                                </div>
                              )}
                            </div>
                            <Badge variant={typeof medication === 'object' && medication.status === 'current' ? 'default' : 'secondary'}>
                              {typeof medication === 'object' ? medication.status || 'Current' : 'Current'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No medications found in the document
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clinical Tab */}
            <TabsContent value="clinical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {extractedData.recommendations && extractedData.recommendations.length > 0 ? (
                      <ul className="space-y-2">
                        {extractedData.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">No recommendations found</div>
                    )}
                  </CardContent>
                </Card>

                {/* Follow-up */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Follow-up
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {extractedData.follow_up || 'No follow-up instructions found'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Clinical Notes */}
              {extractedData.clinical_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Clinical Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm">
                      {extractedData.clinical_notes}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default MedicalDataExtraction;