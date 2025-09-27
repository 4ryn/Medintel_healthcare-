'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, CheckCircle, AlertCircle, Eye } from 'lucide-react'

interface UploadedFile {
  id?: string
  file: File
  preview: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  extractedData?: any
  error?: string
}

export default function DocumentUploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)
  const [selectedData, setSelectedData] = useState<any>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading' as const
    }))
    
    setFiles(prev => [...prev, ...newFiles])
    handleUpload(newFiles)
  }, [])

  const handleUpload = async (filesToUpload: UploadedFile[]) => {
    setIsUploading(true)

    for (const fileData of filesToUpload) {
      try {
        const formData = new FormData()
        formData.append('file', fileData.file)
        formData.append('document_type', 'medical_record')  // Use valid document type

        const response = await fetch('http://localhost:8000/api/v1/documents/upload-simple', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          
          if (result.success) {
            // Extract the AI analysis data with fallback
            let extractedData = null
            if (result.data?.ai_analysis?.extracted_medical_data) {
              extractedData = result.data.ai_analysis.extracted_medical_data
            } else if (result.data?.ai_analysis) {
              // Fallback: use key findings and other AI analysis data
              extractedData = {
                key_findings: result.data.ai_analysis.key_findings || [],
                recommendations: result.data.ai_analysis.recommendations || [],
                document_type: result.data.ai_analysis.document_type,
                medical_terms: result.data.ai_analysis.medical_terms || [],
                llm_success: result.data.ai_analysis.llm_success,
                raw_ai_data: result.data.ai_analysis
              }
            } else {
              extractedData = result.data
            }

            setFiles(prev => prev.map(f => 
              f.file === fileData.file 
                ? { 
                    ...f, 
                    id: result.data?.id,
                    status: 'processing',
                    extractedData: extractedData
                  }
                : f
            ))

            // Simulate processing completion (in real app, you'd poll for status)
            setTimeout(() => {
              setFiles(prev => prev.map(f => 
                f.file === fileData.file 
                  ? { ...f, status: 'completed' }
                  : f
              ))
            }, 3000)
          } else {
            setFiles(prev => prev.map(f => 
              f.file === fileData.file 
                ? { 
                    ...f, 
                    status: 'error',
                    error: result.message || 'Upload failed'
                  }
                : f
            ))
          }
        } else {
          const errorData = await response.json()
          setFiles(prev => prev.map(f => 
            f.file === fileData.file 
              ? { 
                  ...f, 
                  status: 'error',
                  error: errorData.detail || errorData.message || 'Upload failed'
                }
              : f
          ))
        }
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.file === fileData.file 
            ? { 
                ...f, 
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : f
        ))
      }
    }

    setIsUploading(false)
  }

  const removeFile = (fileToRemove: UploadedFile) => {
    setFiles(prev => prev.filter(f => f !== fileToRemove))
    URL.revokeObjectURL(fileToRemove.preview)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt']
    },
    maxSize: 10485760, // 10MB
    multiple: true
  })

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'text-blue-600'
      case 'processing': return 'text-yellow-600'
      case 'completed': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return <Upload className="h-4 w-4 animate-spin" />
      case 'processing': return <FileText className="h-4 w-4 animate-pulse" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Medical Documents</h1>
          <p className="text-gray-600 mt-2">
            Upload lab reports, prescriptions, medical images, or other healthcare documents for AI analysis
          </p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Drag and drop files or click to browse. Supports PDF, images, and text files up to 10MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag 'n' drop medical documents here, or click to select files
                  </p>
                  <Button variant="outline">
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>
                Track the processing status of your uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {files.map((fileData, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={getStatusColor(fileData.status)}>
                        {getStatusIcon(fileData.status)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{fileData.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {fileData.status === 'completed' && fileData.extractedData && (
                          <div className="mt-2 p-2 bg-green-50 rounded-md border-l-2 border-green-400">
                            <p className="text-sm text-green-600 font-medium mb-1">
                              ✓ AI Analysis Complete
                            </p>
                            <div className="text-xs text-gray-600 space-y-1">
                              {/* Structured data display */}
                              {fileData.extractedData.patient_info?.name && (
                                <p>Patient: {fileData.extractedData.patient_info.name}</p>
                              )}
                              {fileData.extractedData.document_info?.report_type && (
                                <p>Type: {fileData.extractedData.document_info.report_type}</p>
                              )}
                              {fileData.extractedData.medications?.length > 0 && (
                                <p>Medications: {fileData.extractedData.medications.length} found</p>
                              )}
                              {fileData.extractedData.laboratory_results && Object.values(fileData.extractedData.laboratory_results).some(v => v !== null) && (
                                <p>Lab Values: {Object.values(fileData.extractedData.laboratory_results).filter(v => v !== null).length} extracted</p>
                              )}
                              
                              {/* Fallback: key findings display */}
                              {fileData.extractedData.key_findings && !fileData.extractedData.patient_info && (
                                <p>Key Findings: {fileData.extractedData.key_findings.length} items extracted</p>
                              )}
                              {fileData.extractedData.document_type && !fileData.extractedData.document_info && (
                                <p>Type: {fileData.extractedData.document_type}</p>
                              )}
                              {fileData.extractedData.medical_terms?.length > 0 && (
                                <p>Medical Terms: {fileData.extractedData.medical_terms.length} identified</p>
                              )}
                            </div>
                          </div>
                        )}
                        {fileData.status === 'error' && fileData.error && (
                          <p className="text-sm text-red-600 mt-1">
                            ✗ {fileData.error}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {fileData.status === 'completed' && fileData.extractedData && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedData(fileData.extractedData)
                            setShowDataModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Data
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(fileData)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Info */}
        {isUploading && (
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Upload className="h-5 w-5 text-blue-600 animate-spin" />
                <div>
                  <p className="font-medium text-blue-900">Processing Documents</p>
                  <p className="text-sm text-blue-700">
                    AI is analyzing your documents and extracting relevant medical data...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium">1. Upload</h3>
                <p className="text-sm text-gray-600">Upload your medical documents</p>
              </div>
              <div className="text-center">
                <FileText className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-medium">2. Process</h3>
                <p className="text-sm text-gray-600">AI extracts and analyzes the data</p>
              </div>
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium">3. Review</h3>
                <p className="text-sm text-gray-600">View extracted insights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Viewing Modal */}
        {showDataModal && selectedData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Extracted Medical Data</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDataModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  {/* Key Findings Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      AI Analysis Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Document Type */}
                      <div className="bg-white rounded-md p-3 shadow-sm">
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Document Type</span>
                        <p className="text-sm font-semibold text-gray-800 mt-1">
                          {selectedData.document_info?.report_type || 'Medical Document'}
                        </p>
                      </div>
                      
                      {/* Patient Name */}
                      {selectedData.patient_info?.name && (
                        <div className="bg-white rounded-md p-3 shadow-sm">
                          <span className="text-xs font-medium text-green-600 uppercase tracking-wider">Patient</span>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {selectedData.patient_info.name}
                          </p>
                        </div>
                      )}
                      
                      {/* Date */}
                      {selectedData.document_info?.report_date && (
                        <div className="bg-white rounded-md p-3 shadow-sm">
                          <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">Date</span>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {selectedData.document_info.report_date}
                          </p>
                        </div>
                      )}
                      
                      {/* Key Lab Values */}
                      {selectedData.laboratory_results && Object.values(selectedData.laboratory_results).some(v => v !== null) && (
                        <div className="bg-white rounded-md p-3 shadow-sm">
                          <span className="text-xs font-medium text-orange-600 uppercase tracking-wider">Lab Values Found</span>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {Object.entries(selectedData.laboratory_results).filter(([k,v]) => v !== null).length} values extracted
                          </p>
                        </div>
                      )}
                      
                      {/* Medications Count */}
                      {selectedData.medications && selectedData.medications.length > 0 && (
                        <div className="bg-white rounded-md p-3 shadow-sm">
                          <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">Medications</span>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {selectedData.medications.length} medication(s)
                          </p>
                        </div>
                      )}
                      
                      {/* Diagnoses Count */}
                      {selectedData.diagnoses && (
                        <div className="bg-white rounded-md p-3 shadow-sm">
                          <span className="text-xs font-medium text-red-600 uppercase tracking-wider">Diagnoses</span>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {[
                              ...(selectedData.diagnoses.primary || []),
                              ...(selectedData.diagnoses.secondary || []),
                              ...(selectedData.diagnoses.chronic_conditions || [])
                            ].length} condition(s)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Findings (Fallback) */}
                  {selectedData.key_findings && !selectedData.patient_info && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border-l-4 border-amber-500">
                      <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-amber-600 rounded-full mr-2"></div>
                        AI Extracted Information
                      </h3>
                      <div className="space-y-2">
                        {selectedData.key_findings && (
                          typeof selectedData.key_findings === 'string' ? (
                            <div className="bg-white rounded-md p-3 shadow-sm border border-amber-200">
                              <p className="text-sm text-gray-800 whitespace-pre-line">{selectedData.key_findings}</p>
                            </div>
                          ) : Array.isArray(selectedData.key_findings) ? (
                            selectedData.key_findings.map((finding: string, index: number) => (
                              <div key={index} className="bg-white rounded-md p-3 shadow-sm border border-amber-200">
                                <p className="text-sm text-gray-800">{finding}</p>
                              </div>
                            ))
                          ) : null
                        )}
                      </div>
                      
                      {selectedData.recommendations && selectedData.recommendations.length > 0 && (
                        <div className="mt-4 p-3 bg-white rounded-md border border-amber-200">
                          <h4 className="text-sm font-semibold text-amber-700 mb-2">AI Recommendations</h4>
                          <ul className="space-y-1">
                            {selectedData.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-gray-800 text-sm flex items-start">
                                <span className="text-amber-600 mr-2">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedData.medical_terms && selectedData.medical_terms.length > 0 && (
                        <div className="mt-4 p-3 bg-white rounded-md border border-amber-200">
                          <h4 className="text-sm font-semibold text-amber-700 mb-2">Medical Terms Identified</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedData.medical_terms.map((term: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                                {term}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Patient Information */}
                  {selectedData.patient_info && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                        Patient Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(selectedData.patient_info).map(([key, value]) => (
                          <div key={key} className="flex flex-col">
                            <span className="text-sm font-medium text-blue-700 capitalize">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-gray-800 mt-1">{String(value) || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Insights & Recommendations */}
                  {(selectedData.recommendations || selectedData.clinical_notes || selectedData.follow_up) && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border-l-4 border-emerald-500">
                      <h3 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></div>
                        AI Insights & Recommendations
                      </h3>
                      
                      {selectedData.clinical_notes && (
                        <div className="mb-4 p-3 bg-white rounded-md border border-emerald-200">
                          <h4 className="text-sm font-semibold text-emerald-700 mb-2">Clinical Notes</h4>
                          <p className="text-gray-800 text-sm">{selectedData.clinical_notes}</p>
                        </div>
                      )}
                      
                      {selectedData.recommendations && selectedData.recommendations.length > 0 && (
                        <div className="mb-4 p-3 bg-white rounded-md border border-emerald-200">
                          <h4 className="text-sm font-semibold text-emerald-700 mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {selectedData.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-gray-800 text-sm flex items-start">
                                <span className="text-emerald-600 mr-2">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedData.follow_up && (
                        <div className="p-3 bg-white rounded-md border border-emerald-200">
                          <h4 className="text-sm font-semibold text-emerald-700 mb-2">Follow-up</h4>
                          <p className="text-gray-800 text-sm">{selectedData.follow_up}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Medical Data */}
                  {selectedData.medical_data && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        Medical Data
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(selectedData.medical_data).map(([key, value]) => (
                          <div key={key} className="flex flex-col">
                            <span className="text-sm font-medium text-green-700 capitalize">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-gray-800 mt-1">
                              {Array.isArray(value) ? value.join(', ') : String(value) || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  {selectedData.medications && Array.isArray(selectedData.medications) && selectedData.medications.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                        Medications
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedData.medications.map((medication: any, index: number) => (
                          <div key={index} className="bg-white rounded-md p-3 border border-purple-200">
                            {typeof medication === 'object' ? (
                              Object.entries(medication).map(([key, value]) => (
                                <div key={key} className="mb-1">
                                  <span className="text-xs font-medium text-purple-700 capitalize">
                                    {key.replace(/_/g, ' ')}:
                                  </span>
                                  <span className="text-sm text-gray-800 ml-1">{String(value)}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-gray-800">{String(medication)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lab Results */}
                  {selectedData.lab_results && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                        Lab Results
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(selectedData.lab_results).map(([key, value]) => (
                          <div key={key} className="flex flex-col">
                            <span className="text-sm font-medium text-orange-700 capitalize">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-gray-800 mt-1">
                              {Array.isArray(value) ? value.join(', ') : String(value) || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagnoses */}
                  {selectedData.diagnoses && Array.isArray(selectedData.diagnoses) && selectedData.diagnoses.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                        Diagnoses
                      </h3>
                      <div className="space-y-2">
                        {selectedData.diagnoses.map((diagnosis: any, index: number) => (
                          <div key={index} className="bg-white rounded-md p-3 border border-red-200">
                            <span className="text-gray-800">{String(diagnosis)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Document Information */}
                  {selectedData.document_info && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                        Document Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedData.document_info.report_type && (
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">Report Type</span>
                            <p className="text-sm font-semibold text-gray-800 mt-1">{selectedData.document_info.report_type}</p>
                          </div>
                        )}
                        {selectedData.document_info.facility && (
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">Facility</span>
                            <p className="text-sm font-semibold text-gray-800 mt-1">{selectedData.document_info.facility}</p>
                          </div>
                        )}
                        {selectedData.document_info.physician && (
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">Physician</span>
                            <p className="text-sm font-semibold text-gray-800 mt-1">{selectedData.document_info.physician}</p>
                          </div>
                        )}
                        {selectedData.document_info.report_date && (
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">Report Date</span>
                            <p className="text-sm font-semibold text-gray-800 mt-1">{selectedData.document_info.report_date}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vital Signs */}
                  {selectedData.vital_signs && Object.values(selectedData.vital_signs).some(v => v !== null) && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        Vital Signs
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedData.vital_signs.blood_pressure_systolic && selectedData.vital_signs.blood_pressure_diastolic && (
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <span className="text-xs font-medium text-green-600 uppercase tracking-wider">Blood Pressure</span>
                            <p className="text-sm font-semibold text-gray-800 mt-1">
                              {selectedData.vital_signs.blood_pressure_systolic}/{selectedData.vital_signs.blood_pressure_diastolic} mmHg
                            </p>
                          </div>
                        )}
                        {selectedData.vital_signs.heart_rate && (
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <span className="text-xs font-medium text-green-600 uppercase tracking-wider">Heart Rate</span>
                            <p className="text-sm font-semibold text-gray-800 mt-1">{selectedData.vital_signs.heart_rate} bpm</p>
                          </div>
                        )}
                        {selectedData.vital_signs.temperature && (
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <span className="text-xs font-medium text-green-600 uppercase tracking-wider">Temperature</span>
                            <p className="text-sm font-semibold text-gray-800 mt-1">{selectedData.vital_signs.temperature}°F</p>
                          </div>
                        )}
                        {selectedData.vital_signs.weight && (
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <span className="text-xs font-medium text-green-600 uppercase tracking-wider">Weight</span>
                            <p className="text-sm font-semibold text-gray-800 mt-1">{selectedData.vital_signs.weight} kg</p>
                          </div>
                        )}
                        {selectedData.vital_signs.height && (
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <span className="text-xs font-medium text-green-600 uppercase tracking-wider">Height</span>
                            <p className="text-sm font-semibold text-gray-800 mt-1">{selectedData.vital_signs.height} cm</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Laboratory Results */}
                  {selectedData.laboratory_results && Object.values(selectedData.laboratory_results).some(v => v !== null && (typeof v !== 'object' || Object.values(v).some(val => val !== null))) && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                        Laboratory Results
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(selectedData.laboratory_results)
                          .filter(([_, value]) => value !== null && (typeof value !== 'object' || Object.values(value).some(val => val !== null)))
                          .map(([key, value]) => (
                            <div key={key} className="bg-white rounded-md p-3 shadow-sm">
                              <span className="text-xs font-medium text-red-600 uppercase tracking-wider">
                                {key.replace(/_/g, ' ')}
                              </span>
                              <p className="text-sm font-semibold text-gray-800 mt-1">
                                {typeof value === 'object' && value !== null 
                                  ? Object.entries(value).map(([k, v]) => v !== null ? `${k}: ${v}` : null).filter(Boolean).join(', ') || 'N/A'
                                  : String(value)
                                }
                              </p>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <Button
                  onClick={() => setShowDataModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}