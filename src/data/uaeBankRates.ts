export interface BankRateDetails {
  bankName: string;
  bankCode: string;
  // Salaried Cases
  stlFixedOptions: { tenure: string; rate: number; display: string }[];
  nonStlFixedOptions: { tenure: string; rate: number; display: string }[];
  stlVariable?: string;
  nonStlVariable?: string;
  // Self-Employed Cases
  selfEmployedFixedOptions: { tenure: string; rate: number; display: string }[];
  selfEmployedFollowOn?: string;
  notes?: string;
}

export interface DropdownRateOption {
  key: string;
  label: string;
  bankCode: string;
  bankName: string;
  category: 'STL' | 'Non-STL' | 'Self-Employed';
  tenure: string;
  rate: number;
  rateDisplay: string;
  variableFollowOn?: string;
  notes?: string;
}

export const LOANZONE_BANK_DATA: BankRateDetails[] = [
  {
    bankName: 'RAK Bank',
    bankCode: 'RAK',
    stlFixedOptions: [
      { tenure: '3 Years Fixed', rate: 4.69, display: '4.69% p.a.' }
    ],
    nonStlFixedOptions: [
      { tenure: '3 Years Fixed', rate: 4.69, display: '4.69% p.a.' }
    ],
    stlVariable: '1.69% + 3 Months EIBOR (Non HIO)',
    nonStlVariable: '1.94% + 3 Months EIBOR (HIO)',
    selfEmployedFixedOptions: [
      { tenure: '3 Years Elite / Business Banking', rate: 4.89, display: '4.89% p.a.' },
      { tenure: '3 Years Non-Elite', rate: 4.99, display: '4.99% p.a.' }
    ],
    selfEmployedFollowOn: '1.75% + 3M EIBOR (Non HIO) / 2.00% + 3M EIBOR (HIO)',
    notes: 'Elite / Business banking pricing available for qualifying clients.'
  },
  {
    bankName: 'FAB (First Abu Dhabi Bank)',
    bankCode: 'FAB',
    stlFixedOptions: [
      { tenure: '1 Year Fixed', rate: 3.99, display: '3.99% p.a.' },
      { tenure: '2 Year Fixed', rate: 3.99, display: '3.99% p.a.' },
      { tenure: '3 Year Fixed', rate: 3.99, display: '3.99% p.a.' },
      { tenure: '5 Year Fixed', rate: 4.19, display: '4.19% p.a.' }
    ],
    nonStlFixedOptions: [
      { tenure: '1 Year Fixed', rate: 4.24, display: '4.24% p.a.' },
      { tenure: '2 Year Fixed', rate: 4.24, display: '4.24% p.a.' },
      { tenure: '3 Year Fixed', rate: 4.24, display: '4.24% p.a.' },
      { tenure: '5 Year Fixed', rate: 4.44, display: '4.44% p.a.' }
    ],
    stlVariable: '1.50% + 3 Months EIBOR (Min Floor 5.0%)',
    nonStlVariable: '1.89% + 3 Months EIBOR (Min Floor 1.99%)',
    selfEmployedFixedOptions: [
      { tenure: '3 Years Fixed (Full Doc)', rate: 4.59, display: '4.59% p.a.' },
      { tenure: '5 Year Fixed (Low Doc)', rate: 4.74, display: '4.74% p.a.' }
    ],
    selfEmployedFollowOn: '2.25% + 3 Months EIBOR',
    notes: 'Floor rate applies on variable periods. Low-doc options available for business owners.'
  },
  {
    bankName: 'Arab Bank',
    bankCode: 'Arab',
    stlFixedOptions: [
      { tenure: '2 Years Fixed', rate: 3.99, display: '3.99% p.a.' },
      { tenure: '3 Years Fixed', rate: 4.25, display: '4.25% p.a.' }
    ],
    nonStlFixedOptions: [
      { tenure: '2 Years Fixed', rate: 4.15, display: '4.15% p.a.' },
      { tenure: '3 Years Fixed', rate: 4.40, display: '4.40% p.a.' }
    ],
    stlVariable: '1.89% + 6 Months EIBOR (Floor rate 3.24%)',
    nonStlVariable: '1.99% + 6 Months EIBOR (Floor rate 3.75%)',
    selfEmployedFixedOptions: [
      { tenure: '2 Years Fixed', rate: 4.89, display: '4.89% p.a.' },
      { tenure: '3 Years Fixed', rate: 4.99, display: '4.99% p.a.' }
    ],
    selfEmployedFollowOn: 'Starting from 2.50% + 6 Months EIBOR',
    notes: 'Credit card activation mandatory for all loan types.'
  },
  {
    bankName: 'DIB (Dubai Islamic Bank)',
    bankCode: 'DIB',
    stlFixedOptions: [
      { tenure: '3 Years Fixed', rate: 4.10, display: '4.10% p.a.' }
    ],
    nonStlFixedOptions: [
      { tenure: '3 Years Fixed', rate: 4.35, display: '4.35% p.a.' }
    ],
    stlVariable: '1.00% + 3 Months EIBOR',
    nonStlVariable: '1.50% + 3 Months EIBOR',
    selfEmployedFixedOptions: [
      { tenure: '3 Years Fixed', rate: 4.35, display: '4.35% p.a.' }
    ],
    selfEmployedFollowOn: '1.75% + 3 Months EIBOR',
    notes: 'Sharia-compliant home finance. Competitive follow-on margin.'
  },
  {
    bankName: 'CBD (Commercial Bank of Dubai)',
    bankCode: 'CBD',
    stlFixedOptions: [
      { tenure: '1 Year Fixed', rate: 5.39, display: '5.39% p.a.' },
      { tenure: '3 Year Fixed', rate: 3.99, display: '3.99% p.a.' },
      { tenure: '5 Year Fixed', rate: 4.69, display: '4.69% p.a.' }
    ],
    nonStlFixedOptions: [
      { tenure: '1 Year Fixed', rate: 5.49, display: '5.49% p.a.' },
      { tenure: '3 Year Fixed', rate: 4.74, display: '4.74% p.a.' },
      { tenure: '5 Year Fixed', rate: 5.09, display: '5.09% p.a.' }
    ],
    stlVariable: 'LTV > 50%: 1.79% + 3M EIBOR | LTV <= 50%: 1.69% + 3M EIBOR',
    nonStlVariable: 'LTV > 50%: 1.99% + 3M EIBOR | LTV <= 50%: 1.89% + 3M EIBOR',
    selfEmployedFixedOptions: [
      { tenure: '1 Year Fixed', rate: 5.29, display: '5.29% p.a.' },
      { tenure: '3 Years Fixed', rate: 5.24, display: '5.24% p.a.' },
      { tenure: '5 Years Fixed', rate: 5.24, display: '5.24% p.a.' }
    ],
    selfEmployedFollowOn: 'LTV > 50%: 1.79%–1.99% + 3M EIBOR',
    notes: 'Tiered margins based on Loan-to-Value (LTV <= 50% vs > 50%).'
  },
  {
    bankName: 'SIB (Sharjah Islamic Bank)',
    bankCode: 'SIB',
    stlFixedOptions: [
      { tenure: '1 Year Fixed', rate: 3.75, display: '3.75% p.a.' },
      { tenure: '3 Year Fixed', rate: 3.99, display: '3.99% p.a.' },
      { tenure: '5 Year Fixed', rate: 4.25, display: '4.25% p.a.' }
    ],
    nonStlFixedOptions: [
      { tenure: '1 Year Fixed', rate: 3.99, display: '3.99% p.a.' },
      { tenure: '3 Year Fixed', rate: 4.25, display: '4.25% p.a.' },
      { tenure: '5 Year Fixed', rate: 4.49, display: '4.49% p.a.' }
    ],
    stlVariable: '1.75% + 3 Months EIBOR',
    nonStlVariable: '1.99% + 3 Months EIBOR',
    selfEmployedFixedOptions: [
      { tenure: '1 Year Fixed', rate: 4.25, display: '4.25% p.a.' },
      { tenure: '3 Years Fixed', rate: 4.49, display: '4.49% p.a.' },
      { tenure: '5 Years Fixed', rate: 4.99, display: '4.99% p.a.' }
    ],
    selfEmployedFollowOn: '2.25% + 3 Months EIBOR',
    notes: 'Competitive 1-year introductory rate with salary transfer.'
  },
  {
    bankName: 'ADIB (Abu Dhabi Islamic Bank)',
    bankCode: 'ADIB',
    stlFixedOptions: [
      { tenure: '2 Year Fixed', rate: 4.14, display: '4.14% p.a.' },
      { tenure: '3 Year Fixed', rate: 4.14, display: '4.14% p.a.' },
      { tenure: 'Buyout 2 Years Fixed', rate: 4.14, display: '4.14% p.a.' }
    ],
    nonStlFixedOptions: [
      { tenure: '2 Year Fixed', rate: 4.29, display: '4.29% p.a.' },
      { tenure: '3 Year Fixed', rate: 4.29, display: '4.29% p.a.' },
      { tenure: 'Buyout 2 Years Fixed', rate: 4.14, display: '4.14% p.a.' }
    ],
    stlVariable: '1.60% + 1 Month EIBOR',
    selfEmployedFixedOptions: [
      { tenure: '2/3 Years Fixed', rate: 4.99, display: '4.99% p.a.' }
    ],
    selfEmployedFollowOn: '1.80% + 1 Month EIBOR',
    notes: 'Special Buyout rate matching standard fixed offers.'
  },
  {
    bankName: 'Mashreq',
    bankCode: 'Mashreq',
    stlFixedOptions: [
      { tenure: 'All Segment 2 Years', rate: 4.99, display: '4.99% p.a.' }
    ],
    nonStlFixedOptions: [],
    stlVariable: '1.75% + 3 Months EIBOR (Day 1: 1.25% + 3M EIBOR)',
    selfEmployedFixedOptions: [],
    selfEmployedFollowOn: '1.50% + 3 Months EIBOR (Day 1 Variable)',
    notes: 'Day 1 variable rate option available starting at 1.25% + 3M EIBOR.'
  },
  {
    bankName: 'ENBD (Emirates NBD)',
    bankCode: 'ENBD',
    stlFixedOptions: [
      { tenure: '2 Years Fixed', rate: 4.19, display: '4.19% p.a.' },
      { tenure: '3 Years Fixed', rate: 4.29, display: '4.29% p.a.' }
    ],
    nonStlFixedOptions: [
      { tenure: '2 Years Fixed', rate: 4.59, display: '4.59% p.a.' },
      { tenure: '3 Years Fixed', rate: 4.69, display: '4.69% p.a.' }
    ],
    stlVariable: '1.99% + 1 Month EIBOR',
    selfEmployedFixedOptions: [
      { tenure: '3 Years Fixed (Priority Banking)', rate: 4.99, display: '4.99% p.a.' },
      { tenure: '3 Years Fixed (Other Self-Employed)', rate: 5.19, display: '5.19% p.a.' }
    ],
    selfEmployedFollowOn: '1.99% + 1 Month EIBOR',
    notes: 'Preferential terms for Priority Banking clients.'
  },
  {
    bankName: 'HSBC',
    bankCode: 'HSBC',
    stlFixedOptions: [
      { tenure: '1 Year Fixed (Income 30K+ / Premier)', rate: 4.29, display: '4.29% p.a.' },
      { tenure: '2 Year Fixed (Income 30K+ / Premier)', rate: 4.49, display: '4.49% p.a.' },
      { tenure: '3 Year Fixed (Income 30K+ / Premier)', rate: 4.89, display: '4.89% p.a.' },
      { tenure: '5 Year Fixed (Income 30K+ / Premier)', rate: 5.75, display: '5.75% p.a.' }
    ],
    nonStlFixedOptions: [
      { tenure: '1 Year Fixed (Income < 30K)', rate: 4.49, display: '4.49% p.a.' },
      { tenure: '2 Year Fixed (Income < 30K)', rate: 4.15, display: '4.15% p.a.' },
      { tenure: '3 Year Fixed (Income < 30K)', rate: 4.39, display: '4.39% p.a.' },
      { tenure: '5 Year Fixed (Income < 30K)', rate: 4.49, display: '4.49% p.a.' }
    ],
    stlVariable: '0.99% + 3M EIBOR (Premier / 30K+) | 1.62% + 3M EIBOR',
    selfEmployedFixedOptions: [],
    selfEmployedFollowOn: '1.17%–1.295% + 3M EIBOR (Contact RM)',
    notes: 'Lowest variable margin (0.99% + EIBOR) for Premier Banking clients.'
  },
  {
    bankName: 'Ajman Bank',
    bankCode: 'Ajman',
    stlFixedOptions: [
      { tenure: 'LTV <= 50%', rate: 4.09, display: '4.09% p.a.' },
      { tenure: 'LTV 51%-60%', rate: 4.20, display: '4.20% p.a.' },
      { tenure: 'LTV 61%-70%', rate: 4.40, display: '4.40% p.a.' },
      { tenure: 'LTV 71%-85%', rate: 4.70, display: '4.70% p.a.' }
    ],
    nonStlFixedOptions: [
      { tenure: 'LTV <= 50%', rate: 4.25, display: '4.25% p.a.' },
      { tenure: 'LTV 51%-60%', rate: 4.40, display: '4.40% p.a.' },
      { tenure: 'LTV 61%-70%', rate: 4.65, display: '4.65% p.a.' },
      { tenure: 'LTV 71%-85%', rate: 4.80, display: '4.80% p.a.' }
    ],
    stlVariable: '1.75% - 1.95% + 3 Months EIBOR',
    nonStlVariable: '1.95% - 2.25% + 3 Months EIBOR',
    selfEmployedFixedOptions: [
      { tenure: 'LTV <= 50%', rate: 4.65, display: '4.65% p.a.' },
      { tenure: 'LTV 51%-60%', rate: 4.80, display: '4.80% p.a.' },
      { tenure: 'LTV 61%-70%', rate: 5.00, display: '5.00% p.a.' },
      { tenure: 'LTV 71%-85%', rate: 5.00, display: '5.00% p.a.' }
    ],
    selfEmployedFollowOn: '2.05% - 2.35% + 3 Months EIBOR',
    notes: 'LTV-tiered structure providing discounts for higher down payments.'
  },
  {
    bankName: 'EIB (Emirates Islamic)',
    bankCode: 'EIB',
    stlFixedOptions: [
      { tenure: '2/3 Years Fixed', rate: 4.09, display: '4.09% p.a.' }
    ],
    nonStlFixedOptions: [
      { tenure: '2/3 Years Fixed', rate: 4.28, display: '4.28% p.a.' }
    ],
    stlVariable: '1.79% + 3 Months EIBOR',
    nonStlVariable: '1.89% + 3 Months EIBOR',
    selfEmployedFixedOptions: [
      { tenure: '2/3 Years Fixed', rate: 4.28, display: '4.28% p.a.' }
    ],
    selfEmployedFollowOn: '1.89% + 3 Months EIBOR',
    notes: 'Islamic home finance solution with uniform fixed pricing for 2 or 3 years.'
  },
  {
    bankName: 'Al Hilal Bank',
    bankCode: 'AlHilal',
    stlFixedOptions: [
      { tenure: '3 Years Fixed', rate: 3.99, display: '3.99% p.a.' }
    ],
    nonStlFixedOptions: [
      { tenure: '3 Years Fixed', rate: 4.19, display: '4.19% p.a.' }
    ],
    stlVariable: '1.99% + 3 Months EIBOR',
    selfEmployedFixedOptions: [
      { tenure: 'UAE Nationals 3/5 Years Fixed', rate: 4.50, display: '4.50% p.a.' }
    ],
    notes: 'Dedicated packages for UAE Nationals and Islamic banking customers.'
  },
  {
    bankName: 'NBF (National Bank of Fujairah)',
    bankCode: 'NBF',
    stlFixedOptions: [
      { tenure: '3 Years Fixed', rate: 4.50, display: '4.50% p.a.' },
      { tenure: '5 Years Fixed', rate: 4.25, display: '4.25% p.a.' }
    ],
    nonStlFixedOptions: [
      { tenure: '3 Years Fixed', rate: 4.75, display: '4.75% p.a.' },
      { tenure: '5 Years Fixed', rate: 4.50, display: '4.50% p.a.' }
    ],
    stlVariable: '1.75% + 3 Months EIBOR (Min Floor 2.99%)',
    nonStlVariable: '1.75% + 3 Months EIBOR (Min Floor 2.99%)',
    selfEmployedFixedOptions: [
      { tenure: '3 Years Fixed', rate: 5.15, display: '5.15% p.a.' },
      { tenure: '5 Years Fixed', rate: 4.89, display: '4.89% p.a.' }
    ],
    selfEmployedFollowOn: '1.75% + 3 Months EIBOR',
    notes: 'Attractive 5-year fixed rate lower than 3-year fixed.'
  }
];

// Generate flattened list of dropdown options categorized by borrower profile
export const FLATTENED_LOANZONE_RATES: { group: string; options: DropdownRateOption[] }[] = [
  {
    group: 'Salaried w/ Salary Transfer (STL)',
    options: [
      {
        key: 'SIB_STL_1Y',
        label: 'SIB (Sharjah Islamic) — 3.75% (1-Yr Fixed)',
        bankCode: 'SIB',
        bankName: 'Sharjah Islamic Bank',
        category: 'STL',
        tenure: '1 Year Fixed',
        rate: 3.75,
        rateDisplay: '3.75% p.a.',
        variableFollowOn: '1.75% + 3M EIBOR'
      },
      {
        key: 'FAB_STL_1Y',
        label: 'FAB (First Abu Dhabi) — 3.99% (1/2/3-Yr Fixed)',
        bankCode: 'FAB',
        bankName: 'First Abu Dhabi Bank',
        category: 'STL',
        tenure: '1/2/3 Years Fixed',
        rate: 3.99,
        rateDisplay: '3.99% p.a.',
        variableFollowOn: '1.50% + 3M EIBOR (Min Floor 5.0%)'
      },
      {
        key: 'CBD_STL_3Y',
        label: 'CBD (Comm. Bank of Dubai) — 3.99% (3-Yr Fixed)',
        bankCode: 'CBD',
        bankName: 'Commercial Bank of Dubai',
        category: 'STL',
        tenure: '3 Year Fixed',
        rate: 3.99,
        rateDisplay: '3.99% p.a.',
        variableFollowOn: '1.69%–1.79% + 3M EIBOR'
      },
      {
        key: 'Arab_STL_2Y',
        label: 'Arab Bank — 3.99% (2-Yr Fixed)',
        bankCode: 'Arab',
        bankName: 'Arab Bank',
        category: 'STL',
        tenure: '2 Years Fixed',
        rate: 3.99,
        rateDisplay: '3.99% p.a.',
        variableFollowOn: '1.89% + 6M EIBOR (Floor 3.24%)'
      },
      {
        key: 'AlHilal_STL_3Y',
        label: 'Al Hilal Bank — 3.99% (3-Yr Fixed)',
        bankCode: 'AlHilal',
        bankName: 'Al Hilal Bank',
        category: 'STL',
        tenure: '3 Years Fixed',
        rate: 3.99,
        rateDisplay: '3.99% p.a.',
        variableFollowOn: '1.99% + 3M EIBOR'
      },
      {
        key: 'EIB_STL_3Y',
        label: 'EIB (Emirates Islamic) — 4.09% (2/3-Yr Fixed)',
        bankCode: 'EIB',
        bankName: 'Emirates Islamic',
        category: 'STL',
        tenure: '2/3 Years Fixed',
        rate: 4.09,
        rateDisplay: '4.09% p.a.',
        variableFollowOn: '1.79% + 3M EIBOR'
      },
      {
        key: 'Ajman_STL_50',
        label: 'Ajman Bank — 4.09% (LTV <= 50%)',
        bankCode: 'Ajman',
        bankName: 'Ajman Bank',
        category: 'STL',
        tenure: 'LTV <= 50%',
        rate: 4.09,
        rateDisplay: '4.09% p.a.',
        variableFollowOn: '1.75% + 3M EIBOR'
      },
      {
        key: 'DIB_STL_3Y',
        label: 'DIB (Dubai Islamic) — 4.10% (3-Yr Fixed)',
        bankCode: 'DIB',
        bankName: 'Dubai Islamic Bank',
        category: 'STL',
        tenure: '3 Years Fixed',
        rate: 4.10,
        rateDisplay: '4.10% p.a.',
        variableFollowOn: '1.00% + 3M EIBOR'
      },
      {
        key: 'ADIB_STL_3Y',
        label: 'ADIB (Abu Dhabi Islamic) — 4.14% (2/3-Yr Fixed)',
        bankCode: 'ADIB',
        bankName: 'Abu Dhabi Islamic Bank',
        category: 'STL',
        tenure: '2/3 Years Fixed',
        rate: 4.14,
        rateDisplay: '4.14% p.a.',
        variableFollowOn: '1.60% + 1M EIBOR'
      },
      {
        key: 'ENBD_STL_2Y',
        label: 'ENBD (Emirates NBD) — 4.19% (2-Yr Fixed)',
        bankCode: 'ENBD',
        bankName: 'Emirates NBD',
        category: 'STL',
        tenure: '2 Years Fixed',
        rate: 4.19,
        rateDisplay: '4.19% p.a.',
        variableFollowOn: '1.99% + 1M EIBOR'
      },
      {
        key: 'NBF_STL_5Y',
        label: 'NBF (Nat. Bank of Fujairah) — 4.25% (5-Yr Fixed)',
        bankCode: 'NBF',
        bankName: 'National Bank of Fujairah',
        category: 'STL',
        tenure: '5 Years Fixed',
        rate: 4.25,
        rateDisplay: '4.25% p.a.',
        variableFollowOn: '1.75% + 3M EIBOR'
      },
      {
        key: 'HSBC_STL_1Y',
        label: 'HSBC — 4.29% (Premier / Income 30K+)',
        bankCode: 'HSBC',
        bankName: 'HSBC',
        category: 'STL',
        tenure: '1 Year Fixed (Premier)',
        rate: 4.29,
        rateDisplay: '4.29% p.a.',
        variableFollowOn: '0.99% + 3M EIBOR'
      },
      {
        key: 'RAK_STL_3Y',
        label: 'RAKBANK — 4.69% (3-Yr Fixed)',
        bankCode: 'RAK',
        bankName: 'RAKBANK',
        category: 'STL',
        tenure: '3 Years Fixed',
        rate: 4.69,
        rateDisplay: '4.69% p.a.',
        variableFollowOn: '1.69% + 3M EIBOR'
      },
      {
        key: 'Mashreq_STL_2Y',
        label: 'Mashreq — 4.99% (All Segment 2-Yr)',
        bankCode: 'Mashreq',
        bankName: 'Mashreq',
        category: 'STL',
        tenure: '2 Years Fixed',
        rate: 4.99,
        rateDisplay: '4.99% p.a.',
        variableFollowOn: '1.75% + 3M EIBOR'
      }
    ]
  },
  {
    group: 'No Salary Transfer (Non-STL)',
    options: [
      {
        key: 'SIB_NSTL_1Y',
        label: 'SIB (Sharjah Islamic) — 3.99% (1-Yr Fixed)',
        bankCode: 'SIB',
        bankName: 'Sharjah Islamic Bank',
        category: 'Non-STL',
        tenure: '1 Year Fixed',
        rate: 3.99,
        rateDisplay: '3.99% p.a.',
        variableFollowOn: '1.99% + 3M EIBOR'
      },
      {
        key: 'Arab_NSTL_2Y',
        label: 'Arab Bank — 4.15% (2-Yr Fixed)',
        bankCode: 'Arab',
        bankName: 'Arab Bank',
        category: 'Non-STL',
        tenure: '2 Years Fixed',
        rate: 4.15,
        rateDisplay: '4.15% p.a.',
        variableFollowOn: '1.99% + 6M EIBOR (Floor 3.75%)'
      },
      {
        key: 'HSBC_NSTL_2Y',
        label: 'HSBC — 4.15% (Income < 30K)',
        bankCode: 'HSBC',
        bankName: 'HSBC',
        category: 'Non-STL',
        tenure: '2 Year Fixed',
        rate: 4.15,
        rateDisplay: '4.15% p.a.',
        variableFollowOn: '1.62% + 3M EIBOR'
      },
      {
        key: 'AlHilal_NSTL_3Y',
        label: 'Al Hilal Bank — 4.19% (3-Yr Fixed)',
        bankCode: 'AlHilal',
        bankName: 'Al Hilal Bank',
        category: 'Non-STL',
        tenure: '3 Years Fixed',
        rate: 4.19,
        rateDisplay: '4.19% p.a.'
      },
      {
        key: 'FAB_NSTL_1Y',
        label: 'FAB (First Abu Dhabi) — 4.24% (1/2/3-Yr Fixed)',
        bankCode: 'FAB',
        bankName: 'First Abu Dhabi Bank',
        category: 'Non-STL',
        tenure: '1/2/3 Years Fixed',
        rate: 4.24,
        rateDisplay: '4.24% p.a.',
        variableFollowOn: '1.89% + 3M EIBOR (Min Floor 1.99%)'
      },
      {
        key: 'Ajman_NSTL_50',
        label: 'Ajman Bank — 4.25% (LTV <= 50%)',
        bankCode: 'Ajman',
        bankName: 'Ajman Bank',
        category: 'Non-STL',
        tenure: 'LTV <= 50%',
        rate: 4.25,
        rateDisplay: '4.25% p.a.',
        variableFollowOn: '1.95% + 3M EIBOR'
      },
      {
        key: 'EIB_NSTL_3Y',
        label: 'EIB (Emirates Islamic) — 4.28% (2/3-Yr Fixed)',
        bankCode: 'EIB',
        bankName: 'Emirates Islamic',
        category: 'Non-STL',
        tenure: '2/3 Years Fixed',
        rate: 4.28,
        rateDisplay: '4.28% p.a.',
        variableFollowOn: '1.89% + 3M EIBOR'
      },
      {
        key: 'ADIB_NSTL_3Y',
        label: 'ADIB (Abu Dhabi Islamic) — 4.29% (2/3-Yr Fixed)',
        bankCode: 'ADIB',
        bankName: 'Abu Dhabi Islamic Bank',
        category: 'Non-STL',
        tenure: '2/3 Years Fixed',
        rate: 4.29,
        rateDisplay: '4.29% p.a.'
      },
      {
        key: 'DIB_NSTL_3Y',
        label: 'DIB (Dubai Islamic) — 4.35% (3-Yr Fixed)',
        bankCode: 'DIB',
        bankName: 'Dubai Islamic Bank',
        category: 'Non-STL',
        tenure: '3 Years Fixed',
        rate: 4.35,
        rateDisplay: '4.35% p.a.',
        variableFollowOn: '1.50% + 3M EIBOR'
      },
      {
        key: 'NBF_NSTL_5Y',
        label: 'NBF (Nat. Bank of Fujairah) — 4.50% (5-Yr Fixed)',
        bankCode: 'NBF',
        bankName: 'National Bank of Fujairah',
        category: 'Non-STL',
        tenure: '5 Years Fixed',
        rate: 4.50,
        rateDisplay: '4.50% p.a.',
        variableFollowOn: '1.75% + 3M EIBOR'
      },
      {
        key: 'ENBD_NSTL_2Y',
        label: 'ENBD (Emirates NBD) — 4.59% (2-Yr Fixed)',
        bankCode: 'ENBD',
        bankName: 'Emirates NBD',
        category: 'Non-STL',
        tenure: '2 Years Fixed',
        rate: 4.59,
        rateDisplay: '4.59% p.a.'
      },
      {
        key: 'RAK_NSTL_3Y',
        label: 'RAKBANK — 4.69% (3-Yr Fixed)',
        bankCode: 'RAK',
        bankName: 'RAKBANK',
        category: 'Non-STL',
        tenure: '3 Years Fixed',
        rate: 4.69,
        rateDisplay: '4.69% p.a.',
        variableFollowOn: '1.94% + 3M EIBOR (HIO)'
      },
      {
        key: 'CBD_NSTL_3Y',
        label: 'CBD (Comm. Bank of Dubai) — 4.74% (3-Yr Fixed)',
        bankCode: 'CBD',
        bankName: 'Commercial Bank of Dubai',
        category: 'Non-STL',
        tenure: '3 Year Fixed',
        rate: 4.74,
        rateDisplay: '4.74% p.a.',
        variableFollowOn: '1.89%–1.99% + 3M EIBOR'
      }
    ]
  },
  {
    group: 'Self-Employed (SE)',
    options: [
      {
        key: 'SIB_SE_1Y',
        label: 'SIB (Sharjah Islamic) — 4.25% (1-Yr Fixed)',
        bankCode: 'SIB',
        bankName: 'Sharjah Islamic Bank',
        category: 'Self-Employed',
        tenure: '1 Year Fixed',
        rate: 4.25,
        rateDisplay: '4.25% p.a.',
        variableFollowOn: '2.25% + 3M EIBOR'
      },
      {
        key: 'EIB_SE_3Y',
        label: 'EIB (Emirates Islamic) — 4.28% (2/3-Yr Fixed)',
        bankCode: 'EIB',
        bankName: 'Emirates Islamic',
        category: 'Self-Employed',
        tenure: '2/3 Years Fixed',
        rate: 4.28,
        rateDisplay: '4.28% p.a.',
        variableFollowOn: '1.89% + 3M EIBOR'
      },
      {
        key: 'DIB_SE_3Y',
        label: 'DIB (Dubai Islamic) — 4.35% (3-Yr Fixed)',
        bankCode: 'DIB',
        bankName: 'Dubai Islamic Bank',
        category: 'Self-Employed',
        tenure: '3 Years Fixed',
        rate: 4.35,
        rateDisplay: '4.35% p.a.',
        variableFollowOn: '1.75% + 3M EIBOR'
      },
      {
        key: 'AlHilal_SE_3Y',
        label: 'Al Hilal Bank — 4.50% (UAE Nationals 3/5-Yr Fixed)',
        bankCode: 'AlHilal',
        bankName: 'Al Hilal Bank',
        category: 'Self-Employed',
        tenure: '3/5 Years Fixed',
        rate: 4.50,
        rateDisplay: '4.50% p.a.'
      },
      {
        key: 'FAB_SE_3Y',
        label: 'FAB (First Abu Dhabi) — 4.59% (3-Yr Full Doc)',
        bankCode: 'FAB',
        bankName: 'First Abu Dhabi Bank',
        category: 'Self-Employed',
        tenure: '3 Years Fixed (Full Doc)',
        rate: 4.59,
        rateDisplay: '4.59% p.a.',
        variableFollowOn: '2.25% + 3M EIBOR'
      },
      {
        key: 'Ajman_SE_50',
        label: 'Ajman Bank — 4.65% (LTV <= 50%)',
        bankCode: 'Ajman',
        bankName: 'Ajman Bank',
        category: 'Self-Employed',
        tenure: 'LTV <= 50%',
        rate: 4.65,
        rateDisplay: '4.65% p.a.',
        variableFollowOn: '2.05% + 3M EIBOR'
      },
      {
        key: 'FAB_SE_5Y',
        label: 'FAB (First Abu Dhabi) — 4.74% (5-Yr Low Doc)',
        bankCode: 'FAB',
        bankName: 'First Abu Dhabi Bank',
        category: 'Self-Employed',
        tenure: '5 Year Fixed (Low Doc)',
        rate: 4.74,
        rateDisplay: '4.74% p.a.'
      },
      {
        key: 'Arab_SE_2Y',
        label: 'Arab Bank — 4.89% (2-Yr Fixed)',
        bankCode: 'Arab',
        bankName: 'Arab Bank',
        category: 'Self-Employed',
        tenure: '2 Years Fixed',
        rate: 4.89,
        rateDisplay: '4.89% p.a.',
        variableFollowOn: 'Starting from 2.50% + 6M EIBOR'
      },
      {
        key: 'RAK_SE_Elite',
        label: 'RAKBANK — 4.89% (3-Yr Elite / Business)',
        bankCode: 'RAK',
        bankName: 'RAKBANK',
        category: 'Self-Employed',
        tenure: '3 Years Elite/Business',
        rate: 4.89,
        rateDisplay: '4.89% p.a.',
        variableFollowOn: '1.75%–2.00% + 3M EIBOR'
      },
      {
        key: 'NBF_SE_5Y',
        label: 'NBF (Nat. Bank of Fujairah) — 4.89% (5-Yr Fixed)',
        bankCode: 'NBF',
        bankName: 'National Bank of Fujairah',
        category: 'Self-Employed',
        tenure: '5 Years Fixed',
        rate: 4.89,
        rateDisplay: '4.89% p.a.',
        variableFollowOn: '1.75% + 3M EIBOR'
      },
      {
        key: 'ENBD_SE_Priority',
        label: 'ENBD (Emirates NBD) — 4.99% (3-Yr Priority Banking)',
        bankCode: 'ENBD',
        bankName: 'Emirates NBD',
        category: 'Self-Employed',
        tenure: '3 Years Priority Banking',
        rate: 4.99,
        rateDisplay: '4.99% p.a.',
        variableFollowOn: '1.99% + 1M EIBOR'
      },
      {
        key: 'ADIB_SE_3Y',
        label: 'ADIB (Abu Dhabi Islamic) — 4.99% (2/3-Yr Fixed)',
        bankCode: 'ADIB',
        bankName: 'Abu Dhabi Islamic Bank',
        category: 'Self-Employed',
        tenure: '2/3 Years Fixed',
        rate: 4.99,
        rateDisplay: '4.99% p.a.',
        variableFollowOn: '1.80% + 1M EIBOR'
      },
      {
        key: 'NBF_SE_3Y',
        label: 'NBF (Nat. Bank of Fujairah) — 5.15% (3-Yr Fixed)',
        bankCode: 'NBF',
        bankName: 'National Bank of Fujairah',
        category: 'Self-Employed',
        tenure: '3 Years Fixed',
        rate: 5.15,
        rateDisplay: '5.15% p.a.',
        variableFollowOn: '1.75% + 3M EIBOR'
      },
      {
        key: 'ENBD_SE_Other',
        label: 'ENBD (Emirates NBD) — 5.19% (3-Yr Other Self-Emp)',
        bankCode: 'ENBD',
        bankName: 'Emirates NBD',
        category: 'Self-Employed',
        tenure: '3 Years Fixed',
        rate: 5.19,
        rateDisplay: '5.19% p.a.',
        variableFollowOn: '1.99% + 1M EIBOR'
      },
      {
        key: 'CBD_SE_3Y',
        label: 'CBD (Comm. Bank of Dubai) — 5.24% (3/5-Yr Fixed)',
        bankCode: 'CBD',
        bankName: 'Commercial Bank of Dubai',
        category: 'Self-Employed',
        tenure: '3/5 Years Fixed',
        rate: 5.24,
        rateDisplay: '5.24% p.a.',
        variableFollowOn: 'LTV > 50%: 1.79%–1.99% + 3M EIBOR'
      }
    ]
  }
];
