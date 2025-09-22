
import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { Role } from '../types';
import { DownloadIcon, ShareIcon } from './Icons';

// --- MOCK DATA FOR TIMETABLES ---

const ecTimetableData = {
  header: {
    title: "GOVERNMENT POLYTECHNIC, SANGAREDDY",
    department: "DEPARTMENT OF ELECTRONICS & COMMUNICATION ENGINEERING",
    semester: "C21-V SEMESTER TIME TABLE- 2025-26",
    wef: "WEF: 12.06.2025"
  },
  timeSlots: [
    "09:45 TO 10:30AM", "10:30 TO 11:15AM", "11:15 TO 12:00PM",
    "12:00 TO 12:45PM", "12:45 TO 01:30PM", "01:30 TO 02:00PM",
    "02:00 TO 02:45PM", "02:45 TO 03:30PM", "03:30 TO 04:15PM",
  ],
  schedule: {
    MON: [
      { code: "ME-501", colSpan: 1 }, { code: "EC-585", colSpan: 2 }, null, { code: "EC-574", colSpan: 2 }, null,
      { code: "LUNCH", colSpan: 1 }, { code: "CS-517", colSpan: 3 }, null, null
    ],
    TUE: [
      { code: "BLANK", colSpan: 1 }, { code: "EC-502", colSpan: 1 }, { code: "EC-503", colSpan: 2 }, null,
      { code: "EC-585", colSpan: 1 }, { code: "LUNCH", colSpan: 1 }, { code: "EC-506", colSpan: 3 }, null, null
    ],
    WED: [
      { code: "EC-574", colSpan: 1 }, { code: "BLANK", colSpan: 1 }, { code: "ME-501", colSpan: 2 }, null,
      { code: "EC-502", colSpan: 1 }, { code: "LUNCH", colSpan: 1 }, { code: "EC-508", colSpan: 3 }, null, null
    ],
    THU: [
      { code: "EC-585", colSpan: 2 }, null, { code: "EC-503", colSpan: 1 }, { code: "EC-574", colSpan: 1 },
      { code: "EC-502", colSpan: 1 }, { code: "LUNCH", colSpan: 1 }, { code: "EC-509", colSpan: 3 }, null, null
    ],
    FRI: [
      { code: "EC-503", colSpan: 2 }, null, { code: "EC-585", colSpan: 2 }, null, { code: "ME-501", colSpan: 1 },
      { code: "LUNCH", colSpan: 1 }, { code: "EC-510", colSpan: 3 }, null, null
    ],
    SAT: [
      { code: "EC-511", colSpan: 5 }, null, null, null, null,
      { code: "LUNCH", colSpan: 1 }, { code: "EC-511", colSpan: 3 }, null, null
    ],
  },
  subjectDetails: [
    { code: "ME-501", name: "Industrial Management & Enterpreneurship", faculty: "TULLURI MANJOLA" },
    { code: "EC-502", name: "Industrial Electronics", faculty: "ARCOT VIDYASAGAR" },
    { code: "EC-503", name: "Data Communication and Computer Networks", faculty: "TULLURI MANJOLA" },
    { code: "EC-574", name: "Mobile & Optical Fibre Communication", faculty: "B.GOPALA RAO" },
    { code: "EC-585", name: "Digital Circuit Design using Verilog VHDL", faculty: "UMASHANKAR" },
    { code: "CS-517", name: "Computer Hardware & Networking Lab", faculty: "TULLURI MANJOLA" },
    { code: "EC-506", name: "Industrial Electronics Lab", faculty: "ARCOT VIDYASAGAR" },
    { code: "EC-508", name: "LabView", faculty: "B.GOPALA RAO" },
    { code: "EC-509", name: "Digital Circuit Design using Verilog HDL", faculty: "UMASHANKER" },
    { code: "EC-510", name: "PROJECT", faculty: "Dr. CH.VIDYA SAGAR/HOD & ALL STAFF" },
    { code: "EC-511", name: "Skill upgradation", faculty: "HOD & ALL STAFF" },
    { code: "LUNCH", name: "LUNCH", faculty: "" },
    { code: "BLANK", name: "", faculty: "" },
  ],
};

const csTimetableData = {
  header: {
    title: "GOVERNMENT POLYTECHNIC, SANGAREDDY",
    department: "DEPARTMENT OF COMPUTER SCIENCE",
    semester: "C21-V SEMESTER TIME TABLE- 2025-26",
    wef: "WEF: 12.06.2025"
  },
  timeSlots: ecTimetableData.timeSlots,
  schedule: {
    MON: [ { code: "CS-501", colSpan: 2 }, null, { code: "CS-502", colSpan: 1 }, { code: "CS-503", colSpan: 2 }, null, { code: "LUNCH", colSpan: 1 }, { code: "CS-504L", colSpan: 3 }, null, null ],
    TUE: [ { code: "CS-502", colSpan: 1 }, { code: "CS-503", colSpan: 1 }, { code: "CS-504", colSpan: 2 }, null, { code: "CS-501", colSpan: 1 }, { code: "LUNCH", colSpan: 1 }, { code: "CS-505L", colSpan: 3 }, null, null ],
    WED: [ { code: "CS-503", colSpan: 1 }, { code: "CS-504", colSpan: 2 }, null, { code: "CS-501", colSpan: 1 }, { code: "CS-502", colSpan: 1 }, { code: "LUNCH", colSpan: 1 }, { code: "CS-506L", colSpan: 3 }, null, null ],
    THU: [ { code: "CS-504", colSpan: 1 }, { code: "CS-501", colSpan: 2 }, null, { code: "CS-502", colSpan: 2 }, null, { code: "LUNCH", colSpan: 1 }, { code: "CS-507", colSpan: 3 }, null, null ],
    FRI: [ { code: "BLANK", colSpan: 1 }, { code: "CS-502", colSpan: 2 }, null, { code: "CS-503", colSpan: 2 }, null, { code: "LUNCH", colSpan: 1 }, { code: "CS-508", colSpan: 3 }, null, null ],
    SAT: [ { code: "CS-509", colSpan: 5 }, null, null, null, null, { code: "LUNCH", colSpan: 1 }, { code: "CS-509", colSpan: 3 }, null, null ],
  },
  subjectDetails: [
    { code: "CS-501", name: "Operating Systems", faculty: "Dr. S.N PADMAVATHI" },
    { code: "CS-502", name: "Database Management", faculty: "HARESH NANDA" },
    { code: "CS-503", name: "Software Engineering", faculty: "DONDILETI SRINIVASA REDDY" },
    { code: "CS-504", name: "Web Technologies", faculty: "G.SADANANDAM" },
    { code: "CS-504L", name: "Web Technologies Lab", faculty: "G.SADANANDAM" },
    { code: "CS-505L", name: "DBMS Lab", faculty: "HARESH NANDA" },
    { code: "CS-506L", name: "Python Lab", faculty: "DONDILETI SRINIVASA REDDY" },
    { code: "CS-507", name: "PROJECT", faculty: "Dr. S.N PADMAVATHI & ALL STAFF" },
    { code: "CS-508", name: "SEMINAR", faculty: "ALL STAFF" },
    { code: "CS-509", name: "Skill upgradation", faculty: "HOD & ALL STAFF" },
    { code: "LUNCH", name: "LUNCH", faculty: "" },
    { code: "BLANK", name: "", faculty: "" },
  ],
};

const mechTimetableData = {
  header: {
    title: "GOVERNMENT POLYTECHNIC, SANGAREDDY",
    department: "DEPARTMENT OF MECHANICAL ENGINEERING",
    semester: "C21-V SEMESTER TIME TABLE- 2025-26",
    wef: "WEF: 12.06.2025"
  },
  timeSlots: ecTimetableData.timeSlots,
  schedule: {
    MON: [ { code: "ME-501", colSpan: 2 }, null, { code: "ME-502", colSpan: 2 }, null, { code: "ME-503", colSpan: 1 }, { code: "LUNCH", colSpan: 1 }, { code: "ME-504L", colSpan: 3 }, null, null ],
    TUE: [ { code: "ME-502", colSpan: 2 }, null, { code: "ME-503", colSpan: 1 }, { code: "ME-504", colSpan: 2 }, null, { code: "LUNCH", colSpan: 1 }, { code: "ME-505L", colSpan: 3 }, null, null ],
    WED: [ { code: "ME-503", colSpan: 1 }, { code: "ME-504", colSpan: 2 }, null, { code: "ME-501", colSpan: 2 }, null, { code: "LUNCH", colSpan: 1 }, { code: "BLANK", colSpan: 3 }, null, null ],
    THU: [ { code: "ME-504", colSpan: 1 }, { code: "ME-501", colSpan: 2 }, null, { code: "ME-502", colSpan: 2 }, null, { code: "LUNCH", colSpan: 1 }, { code: "ME-506", colSpan: 3 }, null, null ],
    FRI: [ { code: "ME-501", colSpan: 1 }, { code: "ME-502", colSpan: 2 }, null, { code: "ME-503", colSpan: 2 }, null, { code: "LUNCH", colSpan: 1 }, { code: "ME-507", colSpan: 3 }, null, null ],
    SAT: [ { code: "ME-508", colSpan: 5 }, null, null, null, null, { code: "LUNCH", colSpan: 1 }, { code: "ME-508", colSpan: 3 }, null, null ],
  },
  subjectDetails: [
    { code: "ME-501", name: "Thermodynamics", faculty: "VANGALA INDIRA PRIYA DARSINI" },
    { code: "ME-502", name: "Fluid Mechanics", faculty: "B. SREE LAKSHMI" },
    { code: "ME-503", name: "Machine Design", faculty: "G.RAJSHEKHARA REDDY" },
    { code: "ME-504", name: "Manufacturing Tech", faculty: "B. SREE LAKSHMI" },
    { code: "ME-504L", name: "Manufacturing Lab", faculty: "B. SREE LAKSHMI" },
    { code: "ME-505L", name: "Fluid Mechanics Lab", faculty: "G.RAJSHEKHARA REDDY" },
    { code: "ME-506", name: "PROJECT", faculty: "VANGALA INDIRA PRIYA DARSINI" },
    { code: "ME-507", name: "SEMINAR", faculty: "ALL STAFF" },
    { code: "ME-508", name: "Skill upgradation", faculty: "HOD & ALL STAFF" },
    { code: "LUNCH", name: "LUNCH", faculty: "" },
    { code: "BLANK", name: "", faculty: "" },
  ],
};

const allTimetables = {
  EC: ecTimetableData,
  CS: csTimetableData,
  MECH: mechTimetableData,
};


const TimetablePage: React.FC<{ user: User | null }> = ({ user }) => {
    const availableBranches = Object.keys(allTimetables);

    const getInitialBranch = () => {
        if (!user) return availableBranches[0];
        // If user is a student and their branch exists in timetables, show it
        if (user.role === Role.STUDENT && availableBranches.includes(user.branch)) {
            return user.branch;
        }
        // For faculty/principal, default to their own branch if available, otherwise the first one
        if (user.branch && availableBranches.includes(user.branch)) {
            return user.branch;
        }
        return availableBranches[0];
    };
    
    const [selectedBranch, setSelectedBranch] = useState<string>(getInitialBranch());

    useEffect(() => {
        setSelectedBranch(getInitialBranch());
    }, [user]);

    const timetableData = allTimetables[selectedBranch as keyof typeof allTimetables];

    const getSubjectByCode = (code: string) => {
        return timetableData.subjectDetails.find(s => s.code === code) || { name: 'N/A', faculty: 'N/A' };
    };
    
    const isLab = (code: string) => code.includes('LAB') || code.includes('PROJECT') || code.includes('Lab');

    const handleDownloadPdf = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${selectedBranch} V-Sem Timetable`,
                    text: `Check out the timetable for ${timetableData.header.department}, 5th Semester.`,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            alert('Share functionality is not supported on your browser.');
        }
    };

    if (!timetableData) {
        return (
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center">
                <p className="text-slate-500 dark:text-slate-400">Timetable not available for {selectedBranch}.</p>
            </div>
        )
    }

    return (
        <div className="printable-area space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4">
                    <div className="text-center sm:text-left flex-grow">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{timetableData.header.title}</h2>
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{timetableData.header.department}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{timetableData.header.semester}</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{timetableData.header.wef}</p>
                    </div>
                    <div className="w-full sm:w-auto flex flex-col items-center gap-4">
                         {user && [Role.PRINCIPAL, Role.HOD, Role.FACULTY].includes(user.role) && (
                            <div className="no-print w-full">
                                <label htmlFor="branch-select" className="sr-only">Select Branch:</label>
                                <select
                                    id="branch-select"
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700"
                                >
                                    {availableBranches.map(branch => (
                                        <option key={branch} value={branch}>{branch} Timetable</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="no-print flex items-center justify-center gap-2">
                            <button onClick={handleDownloadPdf} className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                                <DownloadIcon className="w-4 h-4" /> Download PDF
                            </button>
                            <button onClick={handleShare} className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                                <ShareIcon className="w-4 h-4" /> Share
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-slate-300 dark:border-slate-600">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-700">
                                <th className="p-2 border border-slate-300 dark:border-slate-600 text-xs font-semibold">TIME/DAY</th>
                                {timetableData.timeSlots.map((slot, index) => (
                                    <th key={index} className="p-2 border border-slate-300 dark:border-slate-600 text-xs font-semibold whitespace-nowrap">{slot}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(timetableData.schedule).map(([day, periods]) => (
                                <tr key={day}>
                                    <td className="p-2 border border-slate-300 dark:border-slate-600 font-bold text-center">{day}</td>
                                    {periods.map((period, index) => {
                                        if (period === null) return null;
                                        if (period.code === 'LUNCH') {
                                            return (
                                                <td key={index} rowSpan={Object.keys(timetableData.schedule).length} className="p-2 border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-center font-bold text-lg" style={{writingMode: 'vertical-rl', textOrientation: 'mixed'}}>
                                                    LUNCH
                                                </td>
                                            );
                                        }
                                        const subject = getSubjectByCode(period.code);
                                        const cellColor = period.code === 'BLANK' ? 'bg-slate-50 dark:bg-slate-800' : isLab(subject.name) ? 'bg-sky-100 dark:bg-sky-900/50' : 'bg-amber-50 dark:bg-amber-900/50';
                                        return (
                                            <td key={index} colSpan={period.colSpan} className={`p-2 border border-slate-300 dark:border-slate-600 text-center ${cellColor}`}>
                                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{subject.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{period.code !== 'BLANK' && period.code}</p>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                 <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Subject & Faculty Details</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                             <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">SUB CODE</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">SUB. NAME</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">NAME OF THE FACULTY</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {timetableData.subjectDetails.filter(s => s.code !== 'LUNCH' && s.code !== 'BLANK').map(subject => (
                                <tr key={subject.code}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{subject.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{subject.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{subject.faculty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default TimetablePage;
