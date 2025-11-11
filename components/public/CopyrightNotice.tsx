// MLS® Copyright Notice Component - Required on all pages displaying listing data
import { MLS_COPYRIGHT_NOTICE, RECIPROCITY_LINKS } from '@/lib/constants/compliance';

export default function CopyrightNotice() {
  return (
    <div className="bg-gray-50 border-t border-gray-200 py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-sm text-gray-600 space-y-2">
          <p>{MLS_COPYRIGHT_NOTICE}</p>
          <p>
            <a
              href={RECIPROCITY_LINKS.VREB}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              VREB IDX Reciprocity Program
            </a>
            {' | '}
            <a
              href={RECIPROCITY_LINKS.VIREB}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              VIREB Reciprocity
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
