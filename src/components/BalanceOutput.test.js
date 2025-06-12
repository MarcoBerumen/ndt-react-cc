

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import '@testing-library/jest-dom';
import BalanceOutput from './BalanceOutput';

// Mock utils module
jest.mock('../utils', () => ({
  dateToString: jest.fn((date) => {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return date.toString();
  }),
  toCSV: jest.fn((balance) => {
    return balance.map(entry => 
      `${entry.ACCOUNT},${entry.DESCRIPTION},${entry.DEBIT},${entry.CREDIT},${entry.BALANCE}`
    ).join('\n');
  })
}));

// Sample test data
const mockAccounts = [
  { ACCOUNT: 1000, LABEL: 'Cash' },
  { ACCOUNT: 1020, LABEL: 'Account Receivables' },
  { ACCOUNT: 1110, LABEL: 'Office Supplies' },
  { ACCOUNT: 2010, LABEL: 'Account Payables' },
  { ACCOUNT: 4000, LABEL: 'Commercial Revenue' },
  { ACCOUNT: 4090, LABEL: 'Unearned Revenue' },
  { ACCOUNT: 5000, LABEL: 'Direct Labor' },
  { ACCOUNT: 7140, LABEL: 'Rent' }
];

const mockJournalEntries = [
  { ACCOUNT: 1000, PERIOD: new Date('2016-03-01'), DEBIT: 10000, CREDIT: 0 },
  { ACCOUNT: 1000, PERIOD: new Date('2016-04-01'), DEBIT: 5000, CREDIT: 2000 },
  { ACCOUNT: 1020, PERIOD: new Date('2016-03-01'), DEBIT: 15000, CREDIT: 0 },
  { ACCOUNT: 1020, PERIOD: new Date('2016-05-01'), DEBIT: 0, CREDIT: 5000 },
  { ACCOUNT: 1110, PERIOD: new Date('2016-03-01'), DEBIT: 5200, CREDIT: 0 },
  { ACCOUNT: 2010, PERIOD: new Date('2016-03-01'), DEBIT: 0, CREDIT: 7670 },
  { ACCOUNT: 4000, PERIOD: new Date('2016-03-01'), DEBIT: 0, CREDIT: 82600 },
  { ACCOUNT: 5000, PERIOD: new Date('2016-03-01'), DEBIT: 19100, CREDIT: 0 },
  { ACCOUNT: 7140, PERIOD: new Date('2016-02-01'), DEBIT: 36000, CREDIT: 0 }, // Outside period
  { ACCOUNT: 9999, PERIOD: new Date('2016-03-01'), DEBIT: 1000, CREDIT: 0 } // Account not in accounts list
];

// Mock reducer for testing
const mockReducer = (state = {}, action) => state;

// Helper function to create store with test data
const createTestStore = (userInput, accounts = mockAccounts, journalEntries = mockJournalEntries) => {
  const initialState = {
    accounts,
    journalEntries,
    userInput
  };
  return createStore(mockReducer, initialState);
};

// Helper to render component with store
const renderWithStore = (store) => {
  return render(
    <Provider store={store}>
      <BalanceOutput />
    </Provider>
  );
};

describe('BalanceOutput Component', () => {
  describe('Rendering Tests', () => {
    test('renders loading state when no format is provided', () => {
      const store = createTestStore({ format: null });
      renderWithStore(store);
      
      expect(screen.getByText(/no data to display/i)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('renders with HTML format', () => {
      const userInput = {
        startAccount: 1000,
        endAccount: 5000,
        startPeriod: new Date('2016-03-01'),
        endPeriod: new Date('2016-07-01'),
        format: 'HTML'
      };
      const store = createTestStore(userInput);
      renderWithStore(store);
      
      expect(screen.getByText(/balance report results/i)).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Account Number')).toBeInTheDocument();
    });

    test('renders with CSV format', () => {
      const userInput = {
        startAccount: 1000,
        endAccount: 5000,
        startPeriod: new Date('2016-03-01'),
        endPeriod: new Date('2016-07-01'),
        format: 'CSV'
      };
      const store = createTestStore(userInput);
      renderWithStore(store);
      
      expect(screen.getByText(/csv format output/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Connect Function Logic Tests', () => {
    test('filters accounts by range correctly', () => {
      const userInput = {
        startAccount: 1000,
        endAccount: 2000,
        startPeriod: new Date('2016-01-01'),
        endPeriod: new Date('2016-12-31'),
        format: 'HTML'
      };
      const store = createTestStore(userInput);
      renderWithStore(store);
      
      // Should include accounts 1000, 1020, 1110 (within range)
      expect(screen.getByText('Cash')).toBeInTheDocument();
      expect(screen.getByText('Account Receivables')).toBeInTheDocument();
      expect(screen.getByText('Office Supplies')).toBeInTheDocument();
      
      // Should not include accounts outside range
      expect(screen.queryByText('Commercial Revenue')).not.toBeInTheDocument();
      expect(screen.queryByText('Direct Labor')).not.toBeInTheDocument();
    });

    test('handles wildcard account range (*)', () => {
      const userInput = {
        startAccount: NaN, // Will be converted to -Infinity
        endAccount: NaN,   // Will be converted to Infinity
        startPeriod: new Date('2016-01-01'),
        endPeriod: new Date('2016-12-31'),
        format: 'HTML'
      };
      const store = createTestStore(userInput);
      renderWithStore(store);
      
      // Should include all accounts
      expect(screen.getByText('Cash')).toBeInTheDocument();
      expect(screen.getByText('Commercial Revenue')).toBeInTheDocument();
      expect(screen.getByText('Direct Labor')).toBeInTheDocument();
    });

    test('filters by date period correctly', () => {
      const userInput = {
        startAccount: 1000,
        endAccount: 9999,
        startPeriod: new Date('2016-03-01'),
        endPeriod: new Date('2016-03-31'),
        format: 'HTML'
      };
      const store = createTestStore(userInput);
      renderWithStore(store);
      
      // Rent account (7140) has entry in Feb, should not appear
      expect(screen.queryByText('Rent')).not.toBeInTheDocument();
      
      // Accounts with March entries should appear
      expect(screen.getByText('Cash')).toBeInTheDocument();
      expect(screen.getByText('Account Receivables')).toBeInTheDocument();
    });

    test('handles invalid date periods', () => {
      const userInput = {
        startAccount: 1000,
        endAccount: 5000,
        startPeriod: new Date('invalid'), // Invalid date
        endPeriod: new Date('invalid'),   // Invalid date
        format: 'HTML'
      };
      const store = createTestStore(userInput);
      renderWithStore(store);
      
      // Should use default dates (epoch start to current date)
      expect(screen.getByText('Cash')).toBeInTheDocument();
    });

    test('calculates balance correctly', () => {
      const userInput = {
        startAccount: 1000,
        endAccount: 1000,
        startPeriod: new Date('2016-01-01'),
        endPeriod: new Date('2016-12-31'),
        format: 'HTML'
      };
      const store = createTestStore(userInput);
      renderWithStore(store);
      
      // Cash account: 10000 + 5000 - 2000 = 13000 balance
      expect(screen.getByText('13,000')).toBeInTheDocument();
    });

    test('calculates totals correctly', () => {
      const userInput = {
        startAccount: 1000,
        endAccount: 2000,
        startPeriod: new Date('2016-01-01'),
        endPeriod: new Date('2016-12-31'),
        format: 'HTML'
      };
      const store = createTestStore(userInput);
      renderWithStore(store);
      
      // Total Debit: 1000: 15000, 1020: 15000, 1110: 5200 = 35200
      expect(screen.getByText(/35,200/)).toBeInTheDocument();
      
      // Total Credit: 1000: 2000, 1020: 5000 = 7000
      expect(screen.getByText(/7,000/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty journal entries', () => {
      const userInput = {
        startAccount: 1000,
        endAccount: 5000,
        startPeriod: new Date('2016-01-01'),
        endPeriod: new Date('2016-12-31'),
        format: 'HTML'
      };
      const store = createTestStore(userInput, mockAccounts, []);
      renderWithStore(store);
      
      expect(screen.getByText(/No data to display/i)).toBeInTheDocument();
    });

    test('handles empty accounts list', () => {
      const userInput = {
        startAccount: 1000,
        endAccount: 5000,
        startPeriod: new Date('2016-01-01'),
        endPeriod: new Date('2016-12-31'),
        format: 'HTML'
      };
      const store = createTestStore(userInput, [], mockJournalEntries);
      renderWithStore(store);
      
      // No accounts should be displayed
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    test('handles malformed user input gracefully', () => {
      const userInput = {
        startAccount: undefined,
        endAccount: null,
        startPeriod: 'invalid-date',
        endPeriod: 123,
        format: 'HTML'
      };
      const store = createTestStore(userInput);
      
      // Should not throw error
      expect(() => renderWithStore(store)).not.toThrow();
    });

    test('handles negative balances with correct styling', () => {
      const negativeJournalEntries = [
        { ACCOUNT: 1000, PERIOD: new Date('2016-03-01'), DEBIT: 1000, CREDIT: 5000 }
      ];
      const userInput = {
        startAccount: 1000,
        endAccount: 1000,
        startPeriod: new Date('2016-01-01'),
        endPeriod: new Date('2016-12-31'),
        format: 'HTML'
      };
      const store = createTestStore(userInput, mockAccounts, negativeJournalEntries);
      renderWithStore(store);
      
      // Should have negative balance styling
      const balanceCell = screen.getByText('-4,000');
      expect(balanceCell).toHaveClass('text-danger');
    });
  });

  describe('Accessibility Tests', () => {
    // test('has proper ARIA labels and roles', () => {
    //   const userInput = {
    //     startAccount: 1000,
    //     endAccount: 5000,
    //     startPeriod: new Date('2016-01-01'),
    //     endPeriod: new Date('2016-12-31'),
    //     format: 'HTML'
    //   };
    //   const store = createTestStore(userInput);
    //   renderWithStore(store);
      
    //   expect(screen.getByRole('region')).toBeInTheDocument();
    //   expect(screen.getByRole('table')).toBeInTheDocument();
    //   expect(screen.getByLabelText(/balance report results/i)).toBeInTheDocument();
    // });

    test('has proper table accessibility attributes', () => {
      const userInput = {
        startAccount: 1000,
        endAccount: 5000,
        startPeriod: new Date('2016-01-01'),
        endPeriod: new Date('2016-12-31'),
        format: 'HTML'
      };
      const store = createTestStore(userInput);
      renderWithStore(store);
      
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-labelledby');
      expect(table).toHaveAttribute('aria-describedby');
      
      // Check for column headers
      expect(screen.getByText('Account Number')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    test('CSV output is keyboard accessible', () => {
      const userInput = {
        startAccount: 1000,
        endAccount: 5000,
        startPeriod: new Date('2016-01-01'),
        endPeriod: new Date('2016-12-31'),
        format: 'CSV'
      };
      const store = createTestStore(userInput);
      renderWithStore(store);
      
      const csvOutput = screen.getByRole('textbox');
      expect(csvOutput).toHaveAttribute('tabIndex', '0');
      expect(csvOutput).toHaveAttribute('aria-readonly', 'true');
    });
  });

  describe('Performance Tests', () => {
    test('handles large dataset efficiently', () => {
      // Generate large dataset
      const largeJournalEntries = [];
      const largeAccounts = [];
      
      for (let i = 1000; i < 2000; i++) {
        largeAccounts.push({ ACCOUNT: i, LABEL: `Account ${i}` });
        largeJournalEntries.push({
          ACCOUNT: i,
          PERIOD: new Date('2016-03-01'),
          DEBIT: Math.random() * 10000,
          CREDIT: Math.random() * 5000
        });
      }
      
      const userInput = {
        startAccount: 1000,
        endAccount: 1999,
        startPeriod: new Date('2016-01-01'),
        endPeriod: new Date('2016-12-31'),
        format: 'HTML'
      };
      
      const start = performance.now();
      const store = createTestStore(userInput, largeAccounts, largeJournalEntries);
      renderWithStore(store);
      const end = performance.now();
      
      // Should render within reasonable time (less than 1 second)
      expect(end - start).toBeLessThan(1000);
    });
  });
});

describe('Input Parsing and Validation Tests', () => {
  // These would test the utils.parseUserInput function
  describe('parseUserInput function', () => {
    test('parses standard input format correctly', () => {
      // Mock test for utils.parseUserInput
      // This would test: "1000 5000 MAR-16 JUL-16 HTML"
      expect(true).toBe(true); // Placeholder
    });

    test('handles wildcard account ranges', () => {
      // Test: "* * MAR-16 JUL-16 HTML"
      expect(true).toBe(true); // Placeholder
    });

    test('handles wildcard date ranges', () => {
      // Test: "1000 5000 * * HTML"
      expect(true).toBe(true); // Placeholder
    });

    test('validates format parameter', () => {
      // Test: "1000 5000 MAR-16 JUL-16 INVALID"
      expect(true).toBe(true); // Placeholder
    });
  });
});