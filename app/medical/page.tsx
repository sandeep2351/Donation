import MedicalReportCard from '@/components/MedicalReportCard';
import { FileText, Lock, ExternalLink } from 'lucide-react';

export default function MedicalPage() {
  const reports = [
    {
      id: 1,
      title: 'Pulmonary Function Test (PFT)',
      category: 'LAB_REPORTS',
      description: 'Complete pulmonary function tests showing baseline respiratory capacity and function. All tests completed as part of pre-transplant evaluation.',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      doctorName: 'Dr. Rajesh Sharma',
      hospital: 'Apollo Hospitals',
      documentFileName: 'PFT_Report_2024.pdf',
      cloudinaryUrl: 'https://res.cloudinary.com/[YOUR_CLOUD_NAME]/image/upload/v1[timestamp]/medical-reports/PFT_Report_2024.pdf',
    },
    {
      id: 2,
      title: 'CT Scan - Chest',
      category: 'DIAGNOSIS',
      description: 'High-resolution CT scan of the chest showing the current state of lung disease and areas of concern. Images analyzed by thoracic radiologists.',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      doctorName: 'Dr. Priya Verma',
      hospital: 'Apollo Hospitals',
      documentFileName: 'CT_Scan_Report.pdf',
      cloudinaryUrl: 'https://res.cloudinary.com/[YOUR_CLOUD_NAME]/image/upload/v1[timestamp]/medical-reports/CT_Scan_Report.pdf',
    },
    {
      id: 3,
      title: 'Surgical Evaluation Report',
      category: 'SURGERY_PLAN',
      description: 'Comprehensive surgical evaluation by the transplant surgical team. Confirms patient\'s fitness for surgery and outlines the surgical plan and expected outcomes.',
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      doctorName: 'Dr. Vikram Singh',
      hospital: 'Apollo Hospitals',
      documentFileName: 'Surgical_Evaluation.pdf',
      cloudinaryUrl: 'https://res.cloudinary.com/[YOUR_CLOUD_NAME]/image/upload/v1[timestamp]/medical-reports/Surgical_Evaluation.pdf',
    },
    {
      id: 4,
      title: 'Blood Work & Immunology Panel',
      category: 'LAB_REPORTS',
      description: 'Complete blood work including immunological markers, tissue typing, and HLA matching. Critical for transplant compatibility assessment.',
      date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      doctorName: 'Dr. Anjali Patel',
      hospital: 'Apollo Hospitals',
      documentFileName: 'Bloodwork_Panel.pdf',
      cloudinaryUrl: 'https://res.cloudinary.com/[YOUR_CLOUD_NAME]/image/upload/v1[timestamp]/medical-reports/Bloodwork_Panel.pdf',
    },
    {
      id: 5,
      title: 'Cardiology Clearance',
      category: 'TREATMENT',
      description: 'Cardiac evaluation and clearance for surgery. EKG, echocardiography, and stress tests confirm heart health for the demanding transplant procedure.',
      date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      doctorName: 'Dr. Rohit Kumar',
      hospital: 'Apollo Hospitals',
      documentFileName: 'Cardiology_Report.pdf',
      cloudinaryUrl: 'https://res.cloudinary.com/[YOUR_CLOUD_NAME]/image/upload/v1[timestamp]/medical-reports/Cardiology_Report.pdf',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
          Medical Reports
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          We maintain complete transparency by sharing medical reports and test results. This demonstrates the medical necessity and complexity of the required treatment.
        </p>

        {/* Transparency Statement */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Privacy & Confidentiality</h3>
              <p className="text-sm text-blue-900">
                All personal health information is shared transparently. Medical details confirm the necessity and complexity of the required treatment. Patient privacy is maintained while ensuring accountability and building trust.
              </p>
            </div>
          </div>
        </div>

        {/* Filter by Category */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All', value: 'all' },
              { label: 'Diagnosis', value: 'DIAGNOSIS' },
              { label: 'Treatment', value: 'TREATMENT' },
              { label: 'Surgery Plan', value: 'SURGERY_PLAN' },
              { label: 'Lab Reports', value: 'LAB_REPORTS' },
            ].map((category) => (
              <button
                key={category.value}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:border-emerald-600 hover:bg-emerald-50 transition-colors font-medium text-sm text-gray-700"
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 gap-6 mb-12">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <MedicalReportCard
                      title={report.title}
                      category={report.category}
                      description={report.description}
                      date={report.date}
                      doctorName={report.doctorName}
                      hospital={report.hospital}
                      documentFileName={report.documentFileName}
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <FileText className="w-4 h-4 inline mr-2" />
                  {report.documentFileName}
                </p>
                <a
                  href={report.cloudinaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Document
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Why Share Medical Reports */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why We Share Medical Reports</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <FileText className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Medical Necessity</h3>
                <p className="text-gray-700 text-sm">
                  The reports document the severity of the condition and confirm why a lung transplant is essential for survival and quality of life.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Treatment Complexity</h3>
                <p className="text-gray-700 text-sm">
                  Multiple specialist consultations and extensive testing demonstrate the complexity and cost involved in the transplant process.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <FileText className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Donor Confidence</h3>
                <p className="text-gray-700 text-sm">
                  Transparent medical information builds trust with donors and helps them understand exactly where their contributions are being used.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor's Recommendation */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor's Recommendation</h3>
          <blockquote className="border-l-4 border-emerald-600 pl-6">
            <p className="text-gray-700 italic">
              &quot;Based on comprehensive medical evaluation, the patient requires bilateral lung transplantation. The current pulmonary condition has deteriorated to the point where transplantation is the only viable treatment option. The family has my full support in seeking financial assistance for this life-saving procedure.&quot;
            </p>
            <p className="text-sm text-gray-600 mt-4">
              — Dr. Vikram Singh, Transplant Surgeon, Apollo Hospitals
            </p>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
