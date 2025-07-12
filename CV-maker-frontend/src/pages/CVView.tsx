import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCV } from '../contexts/CVContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  ArrowLeft,
  Edit,
  Download,
  Share2,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Briefcase,
  Building,
  User,
  Languages,
  Check,
  X
  // BookOpen          // ★ NEW – icon for education
} from 'lucide-react';

const CVView: React.FC = () => {
  const { id } = useParams();
  const { getCVById } = useCV();
  const cv = id ? getCVById(id) : null;

  if (!cv) {
    return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">CV Not Found</h2>
          <p className="text-gray-600 mb-6">The CV you're looking for doesn't exist or has been deleted.</p>
          <Link
              to="/cvs"
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to CVs</span>
          </Link>
        </div>
    );
  }

  const handleDownload = async () => {
    try {
      const element = document.getElementById('cv-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${cv.firstName}_${cv.lastName}_CV.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      const element = document.getElementById('cv-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `${cv.firstName}_${cv.lastName}_CV.pdf`, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${cv.firstName} ${cv.lastName}'s CV`,
          text: 'Check out this professional CV',
          files: [file]
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('CV link copied to clipboard! (PDF sharing not supported on this device)');
      }
    } catch (error) {
      console.error('Error sharing CV:', error);
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('CV link copied to clipboard!');
      } catch {
        alert('Unable to share CV. Please try downloading instead.');
      }
    }
  };

  return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link
              to="/cvs"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to CVs</span>
          </Link>

          <div className="flex items-center space-x-3">
            <button
                onClick={handleShare}
                className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Share2 className="w-4 h-4" />
              <span>Share PDF</span>
            </button>
            <button
                onClick={handleDownload}
                className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <Link
                to={`/cv/edit/${cv.id}`}
                className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              <Edit className="w-4 h-4" />
              <span>Edit CV</span>
            </Link>
          </div>
        </div>


        {/* CV Document */}
        <div id="cv-content" className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-orange-600 text-white p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Picture */}
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0">
                {cv.profilePicture ? (
                    <img
                        src={cv.profilePicture}
                        alt={`${cv.firstName} ${cv.lastName}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <User className="w-12 h-12 text-white" />
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">
                  {cv.firstName} {cv.lastName}
                </h1>
                <p className="text-purple-100 text-lg mb-4">
                  {cv.employmentStatus} • Age {cv.age}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-100">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{cv.phoneNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Born {new Date(cv.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-start space-x-2 md:col-span-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{cv.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  cv.isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-800'
              }`}>
                {cv.isActive ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </>
                ) : (
                    <>
                      <X className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                )}
              </span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Personal Info */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <User className="w-6 h-6 text-purple-600" />
                <span>Personal Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Nationality</h3>
                    <p className="text-gray-900 flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span>{cv.nationality}</span>
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Employment Status</h3>
                    <p className="text-gray-900 flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>{cv.employmentStatus}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Preferred Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {cv.preferredLanguages.map((language) => (
                        <span
                            key={language}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                        >
                      <Languages className="w-3 h-3 mr-1" />
                          {language}
                    </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            {/* 2. Education ─────────────────────────────────────────── */}
            {/*<section>*/}
            {/*  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">*/}
            {/*    <BookOpen className="w-6 h-6 text-blue-600" />      /!* ★ NEW *!/*/}
            {/*    <span>Education</span>                               /!* ★ NEW *!/*/}
            {/*  </h2>*/}

            {/*  {cv.education.length > 0 ? (
            {/*      <div className="space-y-6">*/}
            {/*        {cv.education.map((edu) => (*/}
            {/*            <div*/}
            {/*                key={edu.id}*/}
            {/*                className="border-l-4 border-blue-200 pl-6 pb-6 relative"*/}
            {/*            >*/}
            {/*              <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full" />*/}

            {/*              <div className="bg-gray-50 rounded-lg p-6">*/}
            {/*                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">*/}
            {/*                  <div>*/}
            {/*                    <h3 className="text-xl font-bold text-gray-900">*/}
            {/*                      {edu.degree}*/}
            {/*                    </h3>*/}
            {/*                    <p className="text-lg text-blue-600 font-medium">*/}
            {/*                      {edu.institution}*/}
            {/*                    </p>*/}
            {/*                  </div>*/}
            {/*                  <div className="text-sm text-gray-600 mt-2 md:mt-0 md:text-right">*/}
            {/*                    <p className="flex items-center md:justify-end space-x-1">*/}
            {/*                      <Calendar className="w-4 h-4" />*/}
            {/*                      <span>*/}
            {/*                  {new Date(edu.startDate).toLocaleDateString('en-US', {*/}
            {/*                    month: 'short',*/}
            {/*                    year: 'numeric'*/}
            {/*                  })}{' '}*/}
            {/*                        -{' '}*/}
            {/*                        {edu.isCurrent*/}
            {/*                            ? 'Present'*/}
            {/*                            : new Date(edu.endDate).toLocaleDateString('en-US', {*/}
            {/*                              month: 'short',*/}
            {/*                              year: 'numeric'*/}
            {/*                            })}*/}
            {/*                </span>*/}
            {/*                    </p>*/}
            {/*                    {edu.isCurrent && (*/}
            {/*                        <span className="inline-block mt-1 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">*/}
            {/*                  Currently Studying*/}
            {/*                </span>*/}
            {/*                    )}*/}
            {/*                  </div>*/}
            {/*                </div>*/}
            {/*                {edu.description && (*/}
            {/*                    <div>*/}
            {/*                      <h4 className="font-medium text-gray-700 mb-2">Description</h4>*/}
            {/*                      <p className="text-gray-600 leading-relaxed">{edu.description}</p>*/}
            {/*                    </div>*/}
            {/*                )}*/}
            {/*              </div>*/}
            {/*            </div>*/}
            {/*        ))}*/}
            {/*      </div>*/}
            {/*  ) : (*/}
            {/*      <p className="text-gray-500">No education records added.</p>*/}
            {/*  )}*/}
            {/*</section>*/}

            {/* Work Experience */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Building className="w-6 h-6 text-purple-600" />
                <span>Work Experience</span>
              </h2>

              <div className="space-y-6">
                {cv.workExperience.map((experience) => (
                    <div key={experience.id} className="border-l-4 border-purple-200 pl-6 pb-6 relative">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-600 rounded-full"></div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{experience.position}</h3>
                            <p className="text-lg text-purple-600 font-medium">{experience.company}</p>
                          </div>
                          <div className="text-sm text-gray-600 mt-2 md:mt-0 md:text-right">
                            <p className="flex items-center md:justify-end space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                            {new Date(experience.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {
                                experience.isCurrent
                                    ? 'Present'
                                    : new Date(experience.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                              }
                          </span>
                            </p>
                            {experience.isCurrent && (
                                <span className="inline-block mt-1 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                            Current Position
                          </span>
                            )}
                          </div>
                        </div>
                        {experience.description && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                              <p className="text-gray-600 leading-relaxed">{experience.description}</p>
                            </div>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            </section>

            {/* Metadata */}
            <section className="border-t pt-6">
              <div className="text-sm text-gray-500 space-y-1">
                <p>CV created on {new Date(cv.createdAt).toLocaleDateString()}</p>
                <p>Last updated on {new Date(cv.updatedAt).toLocaleDateString()}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
  );
};

export default CVView;
