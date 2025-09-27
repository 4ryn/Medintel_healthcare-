import openai
import json
import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import logging
import cv2
import numpy as np

from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MedicalDataExtraction(BaseModel):
    """Pydantic model for structured medical data extraction"""
    
    # General Information
    patient_name: Optional[str] = Field(None, description="Patient's full name")
    patient_id: Optional[str] = Field(None, description="Patient ID or medical record number")
    report_date: Optional[str] = Field(None, description="Date of the report")
    report_type: Optional[str] = Field(None, description="Type of medical report")
    
    # Vital Signs
    blood_pressure_systolic: Optional[float] = Field(None, description="Systolic blood pressure in mmHg")
    blood_pressure_diastolic: Optional[float] = Field(None, description="Diastolic blood pressure in mmHg")
    heart_rate: Optional[float] = Field(None, description="Heart rate in beats per minute")
    weight: Optional[float] = Field(None, description="Weight in kg")
    height: Optional[float] = Field(None, description="Height in cm")
    bmi: Optional[float] = Field(None, description="Body Mass Index")
    temperature: Optional[float] = Field(None, description="Body temperature in Celsius")
    
    # Laboratory Values
    glucose_fasting: Optional[float] = Field(None, description="Fasting glucose in mg/dL")
    glucose_random: Optional[float] = Field(None, description="Random glucose in mg/dL")
    hba1c: Optional[float] = Field(None, description="HbA1c percentage")
    cholesterol_total: Optional[float] = Field(None, description="Total cholesterol in mg/dL")
    cholesterol_hdl: Optional[float] = Field(None, description="HDL cholesterol in mg/dL")
    cholesterol_ldl: Optional[float] = Field(None, description="LDL cholesterol in mg/dL")
    triglycerides: Optional[float] = Field(None, description="Triglycerides in mg/dL")
    creatinine: Optional[float] = Field(None, description="Serum creatinine in mg/dL")
    bun: Optional[float] = Field(None, description="Blood urea nitrogen in mg/dL")
    
    # Additional Lab Values
    hemoglobin: Optional[float] = Field(None, description="Hemoglobin in g/dL")
    hematocrit: Optional[float] = Field(None, description="Hematocrit percentage")
    wbc_count: Optional[float] = Field(None, description="White blood cell count")
    platelet_count: Optional[float] = Field(None, description="Platelet count")
    
    # Medications
    medications: Optional[List[str]] = Field(None, description="List of current medications")
    
    # Diagnoses and Conditions
    diagnoses: Optional[List[str]] = Field(None, description="List of diagnoses or medical conditions")
    
    # Additional Notes
    notes: Optional[str] = Field(None, description="Additional clinical notes or observations")


class LLMService:
    def __init__(self):
        """Initialize LLM service with OpenRouter API"""
        self.client = openai.OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY
        )
        self.model = "mistralai/mistral-7b-instruct"  # Using Mistral 7B as specified
    
    def extract_medical_data(self, ocr_text: str) -> Dict[str, Any]:
        """Extract structured medical data from OCR text using LLM"""
        try:
            # Handle OCR fallback scenarios
            if "Text extraction requires Tesseract OCR" in ocr_text or "Error:" in ocr_text:
                logger.info("🔄 Handling OCR fallback scenario - providing basic medical document structure")
                
                # Determine document type from OCR description
                document_type = "Unknown Medical Document"
                department = "General"
                
                if "lab report" in ocr_text.lower():
                    document_type = "Laboratory Report"
                    department = "Laboratory"
                elif "x-ray" in ocr_text.lower():
                    document_type = "Radiology Report"
                    department = "Radiology"
                elif "prescription" in ocr_text.lower():
                    document_type = "Prescription"
                    department = "Pharmacy"
                elif "chart image" in ocr_text.lower():
                    document_type = "Clinical Chart"
                    department = "Clinical"
                elif "scan" in ocr_text.lower():
                    document_type = "Imaging Study"
                    department = "Radiology"
                
                # Return structured data with OCR limitation context
                fallback_data = {
                    "patient_info": {
                        "name": "Requires OCR for extraction",
                        "patient_id": None,
                        "date_of_birth": None,
                        "age": None,
                        "gender": None,
                        "contact_info": None
                    },
                    "document_info": {
                        "report_type": document_type,
                        "facility": "Requires OCR for extraction",
                        "physician": "Requires OCR for extraction",
                        "report_date": "Requires OCR for extraction",
                        "department": department
                    },
                    "processing_note": "Document detected but detailed text extraction requires Tesseract OCR installation",
                    "ocr_limitation": True,
                    "suggested_action": "Install Tesseract OCR for complete medical data extraction"
                }
                
                return {
                    "success": True,
                    "extracted_data": fallback_data,
                    "raw_response": f"OCR Fallback Response: {document_type} detected, requires Tesseract for detailed extraction"
                }
            
            # Balanced LLM prompt - intelligent but not overwhelming
            system_prompt = """You are an expert medical data extraction AI that specializes in interpreting OCR text from medical documents.

KEY ABILITIES:
1. INTERPRET OCR ERRORS: Recognize common OCR mistakes and correct them in medical context
2. EXTRACT MEDICAL DATA: Find all vital signs, lab values, patient info from text
3. STRUCTURED OUTPUT: Return complete JSON with all medical fields

OCR INTERPRETATION EXAMPLES:
- "BlosdPresirs,120/80" → Blood Pressure: 120/80 mmHg
- "HeartFas72bpm" → Heart Rate: 72 bpm  
- "fatihtlishnont" → Patient name (keep as extracted)

EXTRACTION PRIORITIES:
1. Patient information (name, ID, age, gender)
2. Vital signs (BP, HR, temperature, weight, height)  
3. Laboratory results (glucose, cholesterol, etc.)
4. Document metadata (date, facility, provider)
5. Clinical notes and recommendations

CRITICAL RULES:
- Use medical knowledge to interpret garbled OCR text
- Extract numerical values with proper units
- Use null only when truly no information is present
- Be intelligent about OCR errors in medical context
- Include normal/abnormal flags and reference ranges when mentioned.
- For medications: include exact names, dosages, frequencies, and routes.
- For lab values: include reference ranges and abnormal flags.
- Use arrays for multiple values or medications.
- Use null only when information is completely absent.
- Maintain chronological order for dated entries.
- Include any provider notes, recommendations, or clinical interpretations.

CRITICAL: Be extremely thorough - medical documents contain vital information that could impact patient care. Extract everything, even if it seems minor.

Return ONLY a valid JSON object with this comprehensive structure. 

CRITICAL JSON FORMATTING RULES:
- NO COMMENTS (no // or /* */ comments)
- NO trailing commas
- NO undefined values - use null instead
- Valid JSON syntax only
{
    "patient_info": {
        "name": "string or null",
        "patient_id": "string or null",
        "date_of_birth": "string or null",
        "age": "number or null",
        "gender": "string or null",
        "contact_info": "string or null"
    },
    "document_info": {
        "report_type": "string or null",
        "facility": "string or null",
        "physician": "string or null",
        "report_date": "string or null",
        "department": "string or null"
    },
    "vital_signs": {
        "blood_pressure_systolic": "number or null",
        "blood_pressure_diastolic": "number or null",
        "heart_rate": "number or null",
        "respiratory_rate": "number or null",
        "oxygen_saturation": "number or null",
        "weight": "number or null",
        "height": "number or null",
        "bmi": "number or null",
        "temperature": "number or null",
        "pain_score": "number or null"
    },
    "laboratory_results": {
        "glucose_fasting": "number or null",
        "glucose_random": "number or null",
        "hba1c": "number or null",
        "creatinine": "number or null",
        "bun": "number or null",
        "sodium": "number or null",
        "potassium": "number or null",
        "chloride": "number or null",
        "co2": "number or null",
        "cholesterol_total": "number or null",
        "cholesterol_hdl": "number or null",
        "cholesterol_ldl": "number or null",
        "triglycerides": "number or null",
        "alt": "number or null",
        "ast": "number or null",
        "bilirubin": {
            "total": "number or null",
            "direct": "number or null",
            "indirect": "number or null"
        },
        "alkaline_phosphatase": "number or null",
        "albumin": "number or null",
        "hemoglobin": "number or null",
        "hematocrit": "number or null",
        "wbc_count": "number or null",
        "rbc_count": "number or null",
        "platelet_count": "number or null",
        "troponin": "number or null",
        "bnp": "number or null",
        "tsh": "number or null",
        "crp": "number or null",
        "esr": "number or null",
        "pt": "number or null",
        "ptt": "number or null",
        "inr": "number or null"
    },
    "medications": [
        {
            "name": "string",
            "dosage": "string",
            "frequency": "string",
            "route": "string",
            "status": "string (current/discontinued)"
        }
    ],
    "allergies": ["array of strings or null"],
    "procedures": ["array of strings or null"],
    "imaging_results": ["array of strings or null"],
    "clinical_notes": "string or null",
    "recommendations": ["array of strings or null"],
    "follow_up": "string or null",
    "additional_findings": "string or null"
}
"""

            user_prompt = f"""EXTRACT ALL MEDICAL DATA FROM THIS OCR TEXT:

OCR TEXT: "{ocr_text}"

INSTRUCTIONS:
1. Interpret OCR errors intelligently (e.g., "BlosdPresirs,120/80" = Blood Pressure 120/80)
2. Extract patient name, vital signs, lab values, dates, facility info
3. Use medical knowledge to understand garbled text
4. Return complete JSON with all medical fields filled where data exists

EXAMPLE INTERPRETATION:
- "fatihtlishnont" could be patient name (keep as-is)
- "BlosdPresirs,120/80" means blood_pressure_systolic: 120, blood_pressure_diastolic: 80  
- "HeartFas72bpm" means heart_rate: 72

CRITICAL: Return ONLY valid JSON - NO comments, NO trailing commas, NO explanatory text. Use null for missing values."""

            # Call LLM with enhanced parameters for better medical extraction
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,  # Slightly higher for creative OCR interpretation
                max_tokens=3000,  # Increased for comprehensive extraction
                top_p=0.9,  # Allow more diverse responses for OCR correction
                frequency_penalty=0.1  # Reduce repetition
            )
            
            # Extract JSON from response
            response_text = response.choices[0].message.content.strip()
            
            # Log the raw response for debugging
            logger.info(f"🔍 Raw LLM Response: {response_text}")

            # Clean and parse JSON
            json_text = self._clean_json_response(response_text)
            extracted_data = json.loads(json_text)
            
            # Basic validation and structure enforcement
            if not isinstance(extracted_data, dict):
                raise ValueError("LLM response is not a valid JSON object")
            
            # Ensure required structure exists but don't override existing data
            if 'patient_info' not in extracted_data:
                extracted_data['patient_info'] = {}
            if 'document_info' not in extracted_data:
                extracted_data['document_info'] = {}
            if 'vital_signs' not in extracted_data:
                extracted_data['vital_signs'] = {}
            if 'laboratory_results' not in extracted_data:
                extracted_data['laboratory_results'] = {}
                
            # Only add missing patient_info fields, don't override existing ones
            patient_info = extracted_data['patient_info']
            if 'name' not in patient_info or patient_info['name'] is None:
                # Try to extract name from OCR if LLM didn't find it
                name_match = re.search(r'(?i)\bPatient[:\s]+([A-Za-z\s]+)', ocr_text)
                if name_match:
                    patient_info['name'] = name_match.group(1).strip()
                elif 'name' not in patient_info:
                    patient_info['name'] = None
            
            if 'date_of_birth' not in patient_info or patient_info['date_of_birth'] is None:
                # Try to extract DOB from OCR if LLM didn't find it
                dob_match = re.search(r'(?i)\b(Date of Birth|DOB)[:\s]+([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}/[0-9]{2}/[0-9]{4}|[A-Za-z]+\s[0-9]{1,2},\s[0-9]{4}|[0-9]{2}-[0-9]{2}-[0-9]{4}|[0-9]{2}\.[0-9]{2}\.[0-9]{4})', ocr_text)
                if dob_match:
                    patient_info['date_of_birth'] = dob_match.group(2)
                elif 'date_of_birth' not in patient_info:
                    patient_info['date_of_birth'] = None
            
            return {
                "success": True,
                "extracted_data": extracted_data,
                "raw_response": response_text
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parsing error: {e}")
            logger.error(f"🔍 Raw Response: {response_text}")
            
            # Fallback: Try to extract medications using regex patterns
            logger.info("🔄 Attempting fallback medication extraction...")
            
            try:
                # Look for medication patterns in the raw response
                medication_patterns = [
                    r'"name"\s*:\s*"([^"]+)"',  # Standard JSON name field
                    r'name.*?:\s*"([^"]+)"',    # Relaxed name field
                ]
                
                found_medications = []
                for pattern in medication_patterns:
                    matches = re.findall(pattern, response_text, re.IGNORECASE)
                    found_medications.extend(matches)
                
                # Remove duplicates and filter medical terms
                unique_meds = []
                seen = set()
                for med in found_medications:
                    med_clean = med.strip()
                    if med_clean and med_clean.lower() not in seen and len(med_clean) > 2:
                        # Basic filter for medication-like names
                        if any(term in med_clean.lower() for term in ['statin', 'ide', 'in', 'zide', 'min', 'zone', 'gly', 'met', 'pran']):
                            unique_meds.append({"name": med_clean, "dosage": None, "frequency": None, "route": None, "status": None})
                            seen.add(med_clean.lower())
                
                if unique_meds:
                    logger.info(f"✅ Fallback extracted {len(unique_meds)} medications")
                    return {
                        "success": True,
                        "extracted_data": {
                            "patient_info": {"name": None, "patient_id": None, "date_of_birth": None, "age": None, "gender": None},
                            "document_info": {"report_type": "Medication List", "facility": None, "physician": None, "report_date": None},
                            "medications": unique_meds,
                            "vital_signs": {},
                            "laboratory_results": {},
                            "recommendations": [],
                            "allergies": [],
                            "procedures": [],
                            "clinical_notes": None
                        }
                    }
            except Exception as fallback_error:
                logger.error(f"❌ Fallback extraction failed: {fallback_error}")
            
            return {
                "success": False,
                "error": f"Failed to parse JSON response: {e}",
                "raw_response": response_text if 'response_text' in locals() else None
            }
        except Exception as e:
            logger.error(f"❌ LLM extraction failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _clean_json_response(self, response_text: str) -> str:
        """Enhanced LLM response cleaning for medical data extraction"""
        # Remove any explanatory text before JSON
        response_text = re.sub(r'^.*?(?=\{)', '', response_text, flags=re.DOTALL)
        
        # Remove markdown code blocks if present
        response_text = re.sub(r'^```json\s*', '', response_text, flags=re.MULTILINE)
        response_text = re.sub(r'^```\s*', '', response_text, flags=re.MULTILINE)
        response_text = re.sub(r'\s*```$', '', response_text, flags=re.MULTILINE)
        
        # Remove JavaScript-style comments that break JSON parsing
        # Remove inline comments first (more aggressive)
        response_text = re.sub(r'\s*//[^\n]*', '', response_text)
        # Remove block comments
        response_text = re.sub(r'/\*.*?\*/', '', response_text, flags=re.DOTALL)
        
        # Remove trailing commas that might break JSON
        response_text = re.sub(r',\s*([}\]])', r'\1', response_text)
        
        # Find the start and end of the JSON object (from first { to last })
        start_pos = response_text.find('{')
        if start_pos == -1:
            return response_text.strip()
        
        # Count braces to find the complete JSON object
        brace_count = 0
        end_pos = start_pos
        for i, char in enumerate(response_text[start_pos:], start_pos):
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_pos = i
                    break
        
        # Extract the complete JSON object
        json_text = response_text[start_pos:end_pos + 1]
        
        # Clean up malformed JSON syntax common in LLM responses
        # Fix unquoted field names
        json_text = re.sub(r'\n\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\n    "\1":', json_text)
        
        # Fix mixed quote styles (ensure double quotes)
        json_text = re.sub(r"'([^']*)'", r'"\1"', json_text)
        
        # Final validation and repair attempt
        try:
            # Test if JSON is valid
            import json
            json.loads(json_text)
            return json_text
        except json.JSONDecodeError:
            # If still invalid, try one more aggressive clean
            # Remove any lines that look like garbage (random text, incomplete structures)
            lines = json_text.split('\n')
            filtered_lines = []
            for line in lines:
                # Keep lines that look like valid JSON structure
                if (any(char in line for char in ['{', '}', '[', ']', ':', '"']) or 
                    line.strip() == '' or
                    'null' in line or
                    line.strip().endswith(',') or
                    line.strip().startswith('"')):
                    filtered_lines.append(line)
            
            return '\n'.join(filtered_lines)
    
    def generate_patient_summary(self, patient_data: Dict[str, Any], recent_vitals: List[Dict]) -> str:
        """Generate a patient summary for clinicians"""
        try:
            system_prompt = """You are a medical AI assistant. Generate a concise clinical summary for a healthcare provider based on patient data and recent vitals. 

Focus on:
1. Key health indicators and trends
2. Risk factors and concerning values
3. Medication adherence patterns
4. Recommendations for follow-up

Keep the summary professional, concise, and actionable."""

            patient_info = f"""
Patient Data:
- Medical Conditions: {patient_data.get('medical_conditions', [])}
- Recent Vitals: {recent_vitals}

Generate a clinical summary in 2-3 paragraphs."""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": patient_info}
                ],
                temperature=0.3,
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"❌ Summary generation failed: {e}")
            return "Unable to generate patient summary at this time."
    
    def generate_notification_text(self, notification_type: str, context: Dict[str, Any]) -> str:
        """Generate personalized notification text"""
        try:
            system_prompt = f"""You are a healthcare communication specialist. Generate a {notification_type} notification message that is:
- Warm and encouraging
- Clear and actionable
- Appropriately urgent based on the type
- Personalized to the patient

Types:
- reminder: Gentle medication/appointment reminders
- alert: Important health metric notifications
- motivation: Encouraging progress messages"""

            user_prompt = f"Generate a {notification_type} message with this context: {context}"

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.5,
                max_tokens=150
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"❌ Notification generation failed: {e}")
            return f"You have a {notification_type} from your healthcare team."

    # Enhanced OCR preprocessing
    def preprocess_ocr_image(image_path):
        """Preprocess the image for better OCR accuracy."""
        # Read the image
        image = cv2.imread(image_path, cv2.IMREAD_COLOR)

        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        # Apply adaptive thresholding
        thresholded = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )

        # Perform morphological operations to enhance text regions
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        morphed = cv2.morphologyEx(thresholded, cv2.MORPH_CLOSE, kernel)

        # Save the preprocessed image
        preprocessed_path = image_path.replace(".pdf", "_preprocessed.png")
        cv2.imwrite(preprocessed_path, morphed)

        return preprocessed_path
