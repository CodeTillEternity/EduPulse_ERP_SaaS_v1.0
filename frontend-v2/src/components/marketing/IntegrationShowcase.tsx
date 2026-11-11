import React, { useState } from 'react';
import { GoogleMeetClassroomDemo } from './GoogleMeetClassroomDemo';
import { NotionCourseNotesDemo } from './NotionCourseNotesDemo';
import { RazorpayFeePaymentDemo } from './RazorpayFeePaymentDemo';

export const IntegrationShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'razorpay' | 'google-meet' | 'notion'>('razorpay');

  return (
    <section id="integrations" className="py-24 sm:py-32 bg-[#FBFBFA] border-t border-zinc-200/80 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <span>Confirmed Integrations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Your institution's tools. Working together.
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            EduPulse connects institutional workflows with the services your faculty and students already use.
          </p>

          {/* Integration Selector Tabs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('razorpay')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                activeTab === 'razorpay'
                  ? 'bg-white border-zinc-300 text-zinc-900 shadow-sm ring-1 ring-zinc-300/50'
                  : 'bg-zinc-100/70 border-zinc-200/70 text-zinc-600 hover:text-zinc-900 hover:bg-white'
              }`}
            >
              <RazorpayLogo className="w-4 h-4" />
              <span>Razorpay Fee Collection</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('google-meet')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                activeTab === 'google-meet'
                  ? 'bg-white border-zinc-300 text-zinc-900 shadow-sm ring-1 ring-zinc-300/50'
                  : 'bg-zinc-100/70 border-zinc-200/70 text-zinc-600 hover:text-zinc-900 hover:bg-white'
              }`}
            >
              <GoogleMeetLogo className="w-4 h-4" />
              <span>Google Meet Classrooms</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notion')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                activeTab === 'notion'
                  ? 'bg-white border-zinc-300 text-zinc-900 shadow-sm ring-1 ring-zinc-300/50'
                  : 'bg-zinc-100/70 border-zinc-200/70 text-zinc-600 hover:text-zinc-900 hover:bg-white'
              }`}
            >
              <NotionLogo className="w-4 h-4" />
              <span>Notion Course Notes</span>
            </button>
          </div>
        </div>

        {/* 1. RAZORPAY INTEGRATION SHOWCASE */}
        {activeTab === 'razorpay' && (
          <RazorpayFeePaymentDemo />
        )}

        {/* 2. GOOGLE MEET INTEGRATION SHOWCASE */}
        {activeTab === 'google-meet' && (
          <GoogleMeetClassroomDemo />
        )}

        {/* 3. NOTION INTEGRATION SHOWCASE */}
        {activeTab === 'notion' && (
          <NotionCourseNotesDemo />
        )}

      </div>
    </section>
  );
};

// Official Razorpay Logo SVG
function RazorpayLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <path
        d="M26.2 92.5L52.8 55.4H36.4L58.2 7.5H23.5L8.5 73.1L26.2 92.5ZM55.2 7.5L42.1 36.3H56.5L34.1 67.5L55.2 90.5L91.5 39.7H74.3L91.5 7.5H55.2Z"
        fill="#002970"
      />
    </svg>
  );
}

// Official Google Meet Logo SVG
function GoogleMeetLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 88 88" fill="none" {...props}>
      <path d="M50 44L66 56V32L50 44Z" fill="#00AA47" />
      <path d="M12 28C12 21.3726 17.3726 16 24 16H42C48.6274 16 54 21.3726 54 28V60C54 66.6274 48.6274 72 42 72H24C17.3726 72 12 66.6274 12 60V28Z" fill="#EA4335" />
      <path d="M54 28L42 16H24C17.3726 16 12 21.3726 12 28L28 44L54 28Z" fill="#4285F4" />
      <path d="M12 60L28 44L54 60V28L12 60Z" fill="#00832D" />
      <path d="M12 60C12 66.6274 17.3726 72 24 72H42C48.6274 72 54 66.6274 54 60L36 44L12 60Z" fill="#2684FC" />
      <path d="M54 44L66 32V56L54 44Z" fill="#00832D" />
      <path d="M66 32L54 44V28C54 23.5817 57.5817 20 62 20C64.2091 20 66 21.7909 66 24V32Z" fill="#00AC47" />
      <path d="M66 56V64C66 66.2091 64.2091 68 62 68C57.5817 68 54 64.4183 54 60V44L66 56Z" fill="#00832D" />
      <path d="M42 16H24C17.3726 16 12 21.3726 12 28H54V28C54 21.3726 48.6274 16 42 16Z" fill="#FFBA00" />
    </svg>
  );
}

// Official Notion Monogram Logo SVG
function NotionLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <path
        d="M6.3 18.2C5.3 17 5.9 15.6 7.4 15.4L78.6 10.3C80.8 10.1 82.8 11.7 83.1 14.1L92.7 80.4C93 82.5 91.8 84.1 89.8 84.4L18.8 89.6C17.2 89.7 15.6 88.9 14.9 87.4L6.3 18.2ZM24.6 27.9L22.9 28.1C21.7 28.2 21.4 29 21.5 29.8L28.3 75.7C28.4 76.5 29.2 77.1 30.2 77L40.7 76.3C41.7 76.2 42 75.4 41.9 74.6L40.7 66.1L60.8 64.6L62.7 74.7C62.9 75.5 63.6 76.1 64.6 76L75.3 75.2C76.3 75.1 76.6 74.3 76.5 73.5L66.7 25.1C66.5 24.3 65.7 23.7 64.8 23.8L54.7 24.5C53.7 24.6 53.4 25.4 53.5 26.2L55.8 42.6L39.8 43.8L37.5 27.2C37.3 26.4 36.6 25.8 35.6 25.9L24.6 27.9Z"
        fill="#000000"
      />
    </svg>
  );
}

export default IntegrationShowcase;
