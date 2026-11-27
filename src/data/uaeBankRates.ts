export interface UAEBankRate {
  code: string;
  name: string;
  fullName: string;
  stl: {
    rate: number;
    display: string;
    details: string;
  };
  nstl: {
    rate: number;
    display: string;
    details: string;
  };
  se: {
    rate: number;
    display: string;
    details: string;
  };
  stressPolicy: string;
}

export const UAE_BANK_RATES: UAEBankRate[] = [
  {
    code: 'DIB',
    name: 'DIB (Dubai Islamic Bank)',
    fullName: 'Dubai Islamic Bank',
    stl: {
      rate: 4.10,
      display: '~4.10% p.a.',
      details: 'Salaried with salary transfer'
    },
    nstl: {
      rate: 4.35,
      display: '~4.35% p.a.',
      details: 'No salary transfer required'
    },
    se: {
      rate: 4.40,
      display: '+0.30% to 0.50% above salaried (~4.40%)',
      details: 'Requires 6 months personal/business bank statements'
    },
    stressPolicy: 'Tested at 2%–4% above initial profit rate to ensure DBR stays under 50%.'
  },
  {
    code: 'ENBD',
    name: 'ENBD (Emirates NBD)',
    fullName: 'Emirates NBD',
    stl: {
      rate: 3.99,
      display: '~3.99% p.a.',
      details: '3-year fixed available'
    },
    nstl: {
      rate: 4.25,
      display: '~4.25% – 4.49% p.a.',
      details: 'No salary transfer'
    },
    se: {
      rate: 4.49,
      display: '~4.49% – 4.75% p.a.',
      details: 'Requires 2 years audited financials or bank statements'
    },
    stressPolicy: 'Affordability stress-tested at 2–4 percentage points above current rate.'
  },
  {
    code: 'EIB',
    name: 'EIB (Emirates Islamic Bank)',
    fullName: 'Emirates Islamic Bank',
    stl: {
      rate: 3.49,
      display: '~3.49% – 3.99% p.a.',
      details: 'Introductory promotional profit rate'
    },
    nstl: {
      rate: 4.10,
      display: '~4.10% – 4.35% p.a.',
      details: 'No salary transfer required'
    },
    se: {
      rate: 3.99,
      display: '+0.30% to 0.50% above salaried (~3.99%)',
      details: 'Requires 6 months of bank statements'
    },
    stressPolicy: 'Standard Central Bank mandate: 2%–4% above introductory rate.'
  },
  {
    code: 'CBD',
    name: 'CBD (Commercial Bank of Dubai)',
    fullName: 'Commercial Bank of Dubai',
    stl: {
      rate: 3.99,
      display: '~3.99% p.a.',
      details: 'Standard salaried mortgage'
    },
    nstl: {
      rate: 4.25,
      display: '~4.25% – 4.49% p.a.',
      details: 'Min. salary: AED 12,000'
    },
    se: {
      rate: 4.50,
      display: '~4.50% – 4.89% p.a.',
      details: 'Business must be operational for at least 2–3 years'
    },
    stressPolicy: 'Tested at 2%–4% above current rate to verify repayment capacity.'
  },
  {
    code: 'RAK',
    name: 'RAK (RAKBANK)',
    fullName: 'RAKBANK',
    stl: {
      rate: 3.89,
      display: '~3.89% – 3.99% p.a.',
      details: '3-year fixed rate available'
    },
    nstl: {
      rate: 4.25,
      display: '~4.25% – 4.69% p.a.',
      details: 'Competitive non-salary transfer rate'
    },
    se: {
      rate: 4.49,
      display: '~4.49% – 4.89% p.a.',
      details: 'Requires 2 years of financial history/statements'
    },
    stressPolicy: 'Affordability checked at 2–4 points above current rate.'
  },
  {
    code: 'Ajman',
    name: 'Ajman (Ajman Bank)',
    fullName: 'Ajman Bank',
    stl: {
      rate: 3.99,
      display: '~3.99% – 4.15% p.a.',
      details: 'Salaried Islamic home finance'
    },
    nstl: {
      rate: 4.25,
      display: '~4.25% – 4.45% p.a.',
      details: 'Available for listed employers'
    },
    se: {
      rate: 4.39,
      display: '~+0.40% above salaried (~4.39%)',
      details: 'Requires 6–12 months of bank statements'
    },
    stressPolicy: 'Applies standard 2%–4% stress buffer on variable rate for DBR calculation.'
  },
  {
    code: 'Arab',
    name: 'Arab (Arab Bank UAE)',
    fullName: 'Arab Bank UAE',
    stl: {
      rate: 3.99,
      display: '3.99% p.a. (2-yr fixed)',
      details: '2-year fixed period'
    },
    nstl: {
      rate: 4.15,
      display: '4.15% p.a. (2-yr fixed)',
      details: '2-year fixed period'
    },
    se: {
      rate: 4.89,
      display: '4.89% p.a. (2-yr fixed)',
      details: 'Requires 12 months statements. Mandatory credit card activation'
    },
    stressPolicy: 'Stress-tested at 2%–4% above initial rate. Credit card activation mandatory.'
  }
];

export interface DropdownRateOption {
  key: string;
  label: string;
  bankCode: string;
  category: 'STL' | 'NSTL' | 'SE';
  rate: number;
  rateDisplay: string;
  requirement: string;
  stressPolicy: string;
}

export const FLATTENED_BANK_RATES: { group: string; options: DropdownRateOption[] }[] = [
  {
    group: 'Salaried w/ Salary Transfer (STL)',
    options: [
      {
        key: 'EIB_STL',
        label: 'EIB (Emirates Islamic) — 3.49% p.a.',
        bankCode: 'EIB',
        category: 'STL',
        rate: 3.49,
        rateDisplay: '~3.49% – 3.99% p.a.',
        requirement: 'Introductory promotional profit rate with salary transfer',
        stressPolicy: 'Standard Central Bank mandate: 2%–4% above introductory rate.'
      },
      {
        key: 'RAK_STL',
        label: 'RAKBANK (RAK) — 3.89% p.a.',
        bankCode: 'RAK',
        category: 'STL',
        rate: 3.89,
        rateDisplay: '~3.89% – 3.99% p.a.',
        requirement: '3-year fixed available with salary transfer',
        stressPolicy: 'Affordability checked at 2–4 points above current rate.'
      },
      {
        key: 'ENBD_STL',
        label: 'Emirates NBD (ENBD) — 3.99% p.a.',
        bankCode: 'ENBD',
        category: 'STL',
        rate: 3.99,
        rateDisplay: '~3.99% p.a. (3-yr fixed avail.)',
        requirement: '3-year fixed available with salary transfer',
        stressPolicy: 'Affordability stress-tested at 2–4 percentage points above current rate.'
      },
      {
        key: 'CBD_STL',
        label: 'Commercial Bank of Dubai (CBD) — 3.99% p.a.',
        bankCode: 'CBD',
        category: 'STL',
        rate: 3.99,
        rateDisplay: '~3.99% p.a.',
        requirement: 'Standard salaried mortgage with salary transfer',
        stressPolicy: 'Tested at 2%–4% above current rate to verify repayment capacity.'
      },
      {
        key: 'Ajman_STL',
        label: 'Ajman Bank — 3.99% p.a.',
        bankCode: 'Ajman',
        category: 'STL',
        rate: 3.99,
        rateDisplay: '~3.99% – 4.15% p.a.',
        requirement: 'Salaried Islamic home finance with salary transfer',
        stressPolicy: 'Applies standard 2%–4% stress buffer on variable rate for DBR calculation.'
      },
      {
        key: 'Arab_STL',
        label: 'Arab Bank UAE — 3.99% p.a.',
        bankCode: 'Arab',
        category: 'STL',
        rate: 3.99,
        rateDisplay: '3.99% p.a. (2-yr fixed)',
        requirement: '2-year fixed period. Credit card activation mandatory',
        stressPolicy: 'Stress-tested at 2%–4% above initial rate. Credit card activation is mandatory for all mortgage types.'
      },
      {
        key: 'DIB_STL',
        label: 'Dubai Islamic Bank (DIB) — 4.10% p.a.',
        bankCode: 'DIB',
        category: 'STL',
        rate: 4.10,
        rateDisplay: '~4.10% p.a.',
        requirement: 'Salaried with salary transfer to DIB',
        stressPolicy: 'Tested at 2%–4% above initial profit rate to ensure DBR stays under 50%.'
      }
    ]
  },
  {
    group: 'No Salary Transfer (NSTL)',
    options: [
      {
        key: 'EIB_NSTL',
        label: 'EIB (Emirates Islamic) — 4.10% p.a.',
        bankCode: 'EIB',
        category: 'NSTL',
        rate: 4.10,
        rateDisplay: '~4.10% – 4.35% p.a.',
        requirement: 'No salary transfer required',
        stressPolicy: 'Standard Central Bank mandate: 2%–4% above introductory rate.'
      },
      {
        key: 'Arab_NSTL',
        label: 'Arab Bank UAE — 4.15% p.a.',
        bankCode: 'Arab',
        category: 'NSTL',
        rate: 4.15,
        rateDisplay: '4.15% p.a. (2-yr fixed)',
        requirement: '2-year fixed. Credit card activation mandatory',
        stressPolicy: 'Stress-tested at 2%–4% above initial rate.'
      },
      {
        key: 'ENBD_NSTL',
        label: 'Emirates NBD (ENBD) — 4.25% p.a.',
        bankCode: 'ENBD',
        category: 'NSTL',
        rate: 4.25,
        rateDisplay: '~4.25% – 4.49% p.a.',
        requirement: 'No salary transfer required',
        stressPolicy: 'Affordability stress-tested at 2–4 percentage points above current rate.'
      },
      {
        key: 'CBD_NSTL',
        label: 'Commercial Bank of Dubai (CBD) — 4.25% p.a.',
        bankCode: 'CBD',
        category: 'NSTL',
        rate: 4.25,
        rateDisplay: '~4.25% – 4.49% p.a.',
        requirement: 'Min. salary: AED 12,000 without transfer',
        stressPolicy: 'Tested at 2%–4% above current rate to verify repayment capacity.'
      },
      {
        key: 'RAK_NSTL',
        label: 'RAKBANK (RAK) — 4.25% p.a.',
        bankCode: 'RAK',
        category: 'NSTL',
        rate: 4.25,
        rateDisplay: '~4.25% – 4.69% p.a.',
        requirement: 'Non-salary transfer program',
        stressPolicy: 'Affordability checked at 2–4 points above current rate.'
      },
      {
        key: 'Ajman_NSTL',
        label: 'Ajman Bank — 4.25% p.a.',
        bankCode: 'Ajman',
        category: 'NSTL',
        rate: 4.25,
        rateDisplay: '~4.25% – 4.45% p.a.',
        requirement: 'Listed employers without transfer',
        stressPolicy: 'Applies standard 2%–4% stress buffer on variable rate for DBR calculation.'
      },
      {
        key: 'DIB_NSTL',
        label: 'Dubai Islamic Bank (DIB) — 4.35% p.a.',
        bankCode: 'DIB',
        category: 'NSTL',
        rate: 4.35,
        rateDisplay: '~4.35% p.a.',
        requirement: 'No salary transfer required',
        stressPolicy: 'Tested at 2%–4% above initial profit rate to ensure DBR stays under 50%.'
      }
    ]
  },
  {
    group: 'Self-Employed (SE)',
    options: [
      {
        key: 'EIB_SE',
        label: 'EIB (Emirates Islamic) — 3.99% p.a.',
        bankCode: 'EIB',
        category: 'SE',
        rate: 3.99,
        rateDisplay: '+0.30% to 0.50% above salaried (~3.99%)',
        requirement: 'Requires 6 months of bank statements',
        stressPolicy: 'Standard Central Bank mandate: 2%–4% above introductory rate.'
      },
      {
        key: 'Ajman_SE',
        label: 'Ajman Bank — 4.39% p.a.',
        bankCode: 'Ajman',
        category: 'SE',
        rate: 4.39,
        rateDisplay: '~+0.40% above salaried rates (~4.39%)',
        requirement: 'Requires 6–12 months of bank statements',
        stressPolicy: 'Applies standard 2%–4% stress buffer on variable rate for DBR calculation.'
      },
      {
        key: 'DIB_SE',
        label: 'Dubai Islamic Bank (DIB) — 4.40% p.a.',
        bankCode: 'DIB',
        category: 'SE',
        rate: 4.40,
        rateDisplay: '+0.30% to 0.50% above salaried (~4.40%)',
        requirement: 'Requires 6 months personal/business bank statements',
        stressPolicy: 'Tested at 2%–4% above initial profit rate to ensure DBR stays under 50%.'
      },
      {
        key: 'ENBD_SE',
        label: 'Emirates NBD (ENBD) — 4.49% p.a.',
        bankCode: 'ENBD',
        category: 'SE',
        rate: 4.49,
        rateDisplay: '~4.49% – 4.75% p.a.',
        requirement: 'Requires 2 years audited financials or bank statements',
        stressPolicy: 'Affordability stress-tested at 2–4 percentage points above current rate.'
      },
      {
        key: 'RAK_SE',
        label: 'RAKBANK (RAK) — 4.49% p.a.',
        bankCode: 'RAK',
        category: 'SE',
        rate: 4.49,
        rateDisplay: '~4.49% – 4.89% p.a.',
        requirement: 'Requires 2 years of financial history/statements',
        stressPolicy: 'Affordability checked at 2–4 points above current rate.'
      },
      {
        key: 'CBD_SE',
        label: 'Commercial Bank of Dubai (CBD) — 4.50% p.a.',
        bankCode: 'CBD',
        category: 'SE',
        rate: 4.50,
        rateDisplay: '~4.50% – 4.89% p.a.',
        requirement: 'Business must be operational for at least 2–3 years',
        stressPolicy: 'Tested at 2%–4% above current rate to verify repayment capacity.'
      },
      {
        key: 'Arab_SE',
        label: 'Arab Bank UAE — 4.89% p.a.',
        bankCode: 'Arab',
        category: 'SE',
        rate: 4.89,
        rateDisplay: '4.89% p.a. (2-yr fixed)',
        requirement: 'Requires 12 months statements. Mandatory credit card activation',
        stressPolicy: 'Stress-tested at 2%–4% above initial rate. Credit card activation mandatory.'
      }
    ]
  }
];
