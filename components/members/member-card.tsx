import React from 'react';
import { Edit, Trash2, Mail, Phone, MapPin, Calendar, Crown } from 'lucide-react';

export function MemberCard({ member, onEdit, onDelete }) {
  // Function to get division display name
  const getDivisionDisplay = (division) => {
    const divisionMap = {
      "divisi agama": "Divisi Agama",
      "divisi sosial": "Divisi Sosial", 
      "divisi lingkungan": "Divisi Lingkungan",
      "divisi perlengkapan": "Divisi Perlengkapan",
      "divisi media": "Divisi Media",
    };
    return divisionMap[division] || division || "Belum ada divisi";
  };

  // Function to get division color
  const getDivisionColor = (division) => {
    const colorMap = {
      "divisi agama": "bg-green-100 text-green-700 border-green-200",
      "divisi sosial": "bg-blue-100 text-blue-700 border-blue-200",
      "divisi lingkungan": "bg-emerald-100 text-emerald-700 border-emerald-200", 
      "divisi perlengkapan": "bg-orange-100 text-orange-700 border-orange-200",
      "divisi media": "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colorMap[division] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  // Function to calculate age
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(member.birth_date);
  const initials = member.full_name ? member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'UN';

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Role indicator */}
      {member.role === 'admin' && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
            <Crown className="h-3 w-3" />
            Admin
          </div>
        </div>
      )}

      {/* Header with gradient background */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 pt-6 pb-4">
        <div className="flex flex-col items-center text-center">
          {/* Profile Picture */}
          <div className="relative mb-4">
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={member.full_name}
                className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
          </div>

          {/* Name and Position */}
          <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
            {member.full_name}
          </h3>
          {member.position && (
            <p className="text-sm text-gray-600 mb-2">
              {member.position}
            </p>
          )}
          
          {/* Division Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getDivisionColor(member.division)}`}>
            {getDivisionDisplay(member.division)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-3">
        {/* Contact Information */}
        <div className="space-y-2">
          {member.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          
          {member.phone_number && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{member.phone_number}</span>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{age ? `${age} tahun` : 'Usia tidak diketahui'}</span>
          </div>
          
          {member.birth_place && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="truncate max-w-20">{member.birth_place}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-6">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(member)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          
          <button
            onClick={() => onDelete(member)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </button>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
    </div>
  );
}