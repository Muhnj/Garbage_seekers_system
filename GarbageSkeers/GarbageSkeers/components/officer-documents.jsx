'use client';
import { FileText, Download } from 'lucide-react';
import Image from 'next/image';

const OfficerDocuments = ({ documents, nationalId }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-6">Officer Documents</h2>
      
      <div className="space-y-6">
        {/* National ID Section */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <FileText className="text-main" size={18} />
            National Identification
          </h3>
          
          {nationalId ? (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-48 h-32 border rounded-lg overflow-hidden">
                <Image
                  src={nationalId}
                  alt="National ID"
                  width={192}
                  height={128}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">National ID Card</p>
                <button className="flex items-center gap-2 text-sm text-main">
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No national ID uploaded</p>
          )}
        </div>

        {/* Additional Documents Section */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <FileText className="text-main" size={18} />
            Supporting Documents
          </h3>
          
          {documents?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc, index) => (
                <div key={index} className="border rounded-lg p-4 flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <FileText className="text-gray-400" size={24} />
                  </div>
                  <div>
                    <p className="font-medium">Document {index + 1}</p>
                    <p className="text-sm text-gray-500 mb-2">Uploaded: {new Date().toLocaleDateString()}</p>
                    <button className="flex items-center gap-1 text-sm text-main">
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No additional documents uploaded</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficerDocuments;