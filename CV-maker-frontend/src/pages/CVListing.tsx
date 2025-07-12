import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCV } from '../contexts/CVContext';
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  Phone,
  MapPin,
  Check,
  X
  // BookOpen      // ★ NEW – icon for education

} from 'lucide-react';

const CVListing: React.FC = () => {
  const { getUserCVs, deleteCV } = useCV();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [cvToDelete, setCvToDelete] = useState<string | null>(null);

  const allCVs = getUserCVs();
  
  // Filter CVs based on search and filter criteria
  const filteredCVs = allCVs.filter(cv => {
    const matchesSearch = 
      cv.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.phoneNumber.includes(searchTerm) ||
      cv.address.toLowerCase().includes(searchTerm.toLowerCase());
    // /* 2. education (institution OR degree) – ★ NEW */
    // const matchesEducation =
    //     cv.education?.some(
    //         ed =>
    //             ed.institution.toLowerCase().includes(lcSearch) ||
    //             ed.degree.toLowerCase().includes(lcSearch)
    //     ) ?? false;
    //
    // const matchesSearch = matchesBasic || matchesEducation;
    
    const matchesFilter = 
      filterActive === 'all' ||
      (filterActive === 'active' && cv.isActive) ||
      (filterActive === 'inactive' && !cv.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleDeleteCV = (id: string) => {
    deleteCV(id);
    setCvToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My CVs</h1>
          <p className="text-gray-600 mt-1">Manage your professional CVs</p>
        </div>
        <Link
          to="/cv/new"
          className="bg-gradient-to-r from-purple-600 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Create New CV</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search CVs by name, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All CVs</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* CV Grid */}
      {filteredCVs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCVs.map((cv) => (
            <div key={cv.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* CV Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {cv.firstName} {cv.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">Age: {cv.age}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{cv.phoneNumber}</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{cv.address}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Updated {new Date(cv.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Work Experience Count */}
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    {cv.workExperience.length} work experience{cv.workExperience.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {/* ★ NEW – education count */}
              {/*  <div className="flex items-center text-sm text-gray-500">*/}
              {/*    <BookOpen className="w-4 h-4 mr-1 text-gray-400" />*/}
              {/*    <span>*/}
              {/*        {cv.education?.length ?? 0} education*/}
              {/*      {(cv.education?.length ?? 0) !== 1 ? 's' : ''}*/}
              {/*      </span>*/}
              {/*  </div>*/}
              {/*</div>*/}

              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <Link
                  to={`/cv/view/${cv.id}`}
                  className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/cv/edit/${cv.id}`}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setCvToDelete(cv.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-100 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No CVs found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterActive !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first professional CV'
            }
          </p>
          <Link
            to="/cv/new"
            className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Create New CV</span>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {cvToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete CV</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this CV? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setCvToDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCV(cvToDelete)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVListing;