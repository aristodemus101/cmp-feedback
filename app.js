'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Award, TrendingUp } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

export default function StudentDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load CSV
  useEffect(() => {
    const loadCSV = async () => {
      try {
        const response = await fetch('/data.csv');
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        setStudentsData(parsed);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading CSV:', error);
        setStudentsData([]);
        setIsLoading(false);
      }
    };
    loadCSV();
  }, []);

  // Parse CSV
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const cleanCols = cols.map(c => c.replace(/^"|"$/g, '').trim());
      return {
        timestamp: cleanCols[0],
        email: cleanCols[1],
        panelistName: cleanCols[2],
        studentName: cleanCols[3],
        communication: parseRating(cleanCols[4]),
        bodyLanguage: parseRating(cleanCols[5]),
        domainKnowledge: parseRating(cleanCols[6]),
        analyticalThinking: parseRating(cleanCols[7]),
        leadership: parseRating(cleanCols[8]),
        culturalFit: parseRating(cleanCols[9]),
        overall: cleanCols[10],
        feedback: cleanCols[11],
      };
    });
  };

  const parseRating = (str) => {
    if (!str) return 3;
    const match = str.match(/^(\d)/);
    return match ? parseInt(match[1]) : 3;
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return [];
    return studentsData.filter(s =>
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, studentsData]);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSearchTerm('');
  };

  const getChartData = (student) => [
    { skill: 'Communication', value: student.communication },
    { skill: 'Body Language', value: student.bodyLanguage },
    { skill: 'Domain Knowledge', value: student.domainKnowledge },
    { skill: 'Analytical Thinking', value: student.analyticalThinking },
    { skill: 'Leadership', value: student.leadership },
    { skill: 'Cultural Fit', value: student.culturalFit }
  ];

  const getAverageScore = (student) => {
    const total = student.communication + student.bodyLanguage + student.domainKnowledge + student.analyticalThinking + student.leadership + student.culturalFit;
    return (total / 6).toFixed(1);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading student data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Career Mentorship Program 8.0</h1>
            <p className="mt-1 text-sm text-gray-500">Student Performance Dashboard</p>
          </div>
          <Award className="h-12 w-12 text-indigo-600" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search for a student by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-lg"
          />

          {/* Search Results */}
          {searchTerm && filteredStudents.length > 0 && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {filteredStudents.map((student, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStudentSelect(student)}
                  className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0"
                >
                  <p className="font-semibold text-gray-900">{student.studentName}</p>
                  <p className="text-sm text-gray-500">
                    Avg Score: {getAverageScore(student)}/5.0 • Evaluated by {student.panelistName}
                  </p>
                </button>
              ))}
            </div>
          )}
          {searchTerm && filteredStudents.length === 0 && (
            <div className="mt-2 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">No students found matching "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Student Details */}
        {selectedStudent ? (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{selectedStudent.studentName}</h2>
                <p className="text-sm text-gray-500 mt-1">Evaluated by: <span className="font-medium">{selectedStudent.panelistName}</span></p>
                <p className="text-xs text-gray-400 mt-1">{selectedStudent.timestamp}</p>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getRatingColor(parseFloat(getAverageScore(selectedStudent)))}`}>
                  {getAverageScore(selectedStudent)}
                </div>
                <p className="text-sm text-gray-500 mt-1">Average Score</p>
                <div className="flex items-center justify-end mt-2 text-xs text-gray-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  out of 5.0
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance Metrics</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={getChartData(selectedStudent)}>
                  <PolarGrid stroke="#e5e7eb" strokeWidth={1.5} />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={90} domain={[0,5]} tick={{ fill:'#6b7280', fontSize: 12 }} tickCount={6} />
                  <Radar name="Rating" dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.5} strokeWidth={2} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                </RadarChart>
              </ResponsiveContainer>

              {/* Rating Cards */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {getChartData(selectedStudent).map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">{item.skill}</p>
                    <p className={`text-2xl font-bold ${getRatingColor(item.value)}`}>{item.value}/5</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Overall Interview Performance</h3>
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-600 p-5 rounded-lg">
                <p className="text-indigo-900 font-medium text-lg">{selectedStudent.overall}</p>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Qualitative Feedback & Comments</h3>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <p className="text-gray-700 leading-relaxed text-base">{selectedStudent.feedback}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Search for a Student</h3>
            <p className="text-gray-500">Use the search bar above to find and view student performance data</p>
          </div>
        )}
      </div>
    </div>
  );
}
