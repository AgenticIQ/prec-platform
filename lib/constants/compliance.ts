// MLS® Compliance Constants - VIVA System Rules

export const MLS_COPYRIGHT_NOTICE =
  "MLS® property information is provided under copyright© by the Vancouver Island Real Estate Board and Victoria Real Estate Board. The information is from sources deemed reliable, but should not be relied upon without independent verification.";

export const RECIPROCITY_LINKS = {
  VREB: "https://www.vreb.org/vreb-idx-reciprocity-program",
  VIREB: "https://reciprocity.vireb.com/"
};

export const MAX_SEARCH_RESULTS = 350;

export const DATA_REFRESH_INTERVAL_HOURS = 24;

export const CLIENT_EXPIRY_DAYS = {
  DEFAULT: 90,
  MAXIMUM: 180
};

export const TERMS_OF_USE = `
# Terms of Use - PREC Real Estate Client Portal

## Acknowledgment and Agreement

By accessing this Virtual Office Website (VOW), you acknowledge and agree to the following terms:

### 1. Receipt of Disclosure Document
You acknowledge that you have received, read, and understood the "Disclosure of Representation in Trading Services" document published by the BC Financial Services Authority.

### 2. Personal Use Only
The MLS® property information provided through this portal is for your personal, non-commercial use only. You agree not to use this information for any commercial purpose or in any way that competes with the services of PREC Real Estate or the MLS® system.

### 3. Bona Fide Interest
You represent that you have a bona fide interest in the purchase or sale of real estate in the Victoria BC and Vancouver Island region.

### 4. No Redistribution
You agree that you will not copy, redistribute, retransmit, or otherwise share any MLS® data obtained through this portal with any third party or through any medium, including but not limited to email, social media, or public websites.

### 5. Copyright Acknowledgment
You acknowledge that all MLS® property information is provided under copyright© by the Vancouver Island Real Estate Board and Victoria Real Estate Board. This information is from sources deemed reliable, but should not be relied upon without independent verification.

### 6. No Agency Created
Nothing in these Terms of Use or your use of this portal creates an agency relationship, fiduciary duty, or any financial obligation between you and PREC Real Estate, the Vancouver Island Real Estate Board, or the Victoria Real Estate Board.

### 7. Privacy and Data Sharing
Your personal information will be used solely for the purpose of providing you with real estate search services. Your information may be shared with the Vancouver Island Real Estate Board and Victoria Real Estate Board for auditing and compliance purposes.

### 8. Account Expiry
Your access to this portal will automatically expire 90 days from the date of registration. You will receive notification prior to expiry and may request an extension up to a maximum of 180 days. After 180 days, you must re-register to continue accessing the portal.

### 9. Termination
PREC Real Estate reserves the right to terminate your access to this portal at any time for violation of these Terms of Use or for any other reason.

### 10. Modifications
PREC Real Estate reserves the right to modify these Terms of Use at any time. Continued use of the portal after modifications constitutes acceptance of the updated terms.

## Contact Information
For questions about these Terms of Use or your account, please contact your PREC Real Estate agent.

---

**By clicking "I Accept" below, you confirm that you have read, understood, and agree to be bound by these Terms of Use.**
`;

export const ALLOWED_FILTER_CRITERIA = [
  'geography',
  'city',
  'neighborhood',
  'price',
  'propertyType',
  'bedrooms',
  'bathrooms',
  'squareFeet',
  'lotSize',
  'features',
  'yearBuilt'
];

export const PROHIBITED_LISTING_STATUSES_IDX = [
  'Sold',
  'Pending',
  'Expired',
  'Cancelled',
  'Withdrawn'
];

export const ANTI_SCRAPING_MESSAGE =
  "This information is for consumer use only and may not be used for any purpose other than to identify prospective properties consumers may be interested in purchasing.";
