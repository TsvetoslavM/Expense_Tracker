import React from 'react';
import { useCurrency } from '../hooks/useCurrency';

interface CurrencyDisplayProps {
  amount: number;
  sourceCurrency?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  sourceCurrency = 'USD' 
}) => {
  const { preferredCurrency, convertAndFormat } = useCurrency();
  
  return (
    <div>
      <span>{convertAndFormat(amount, sourceCurrency)}</span>
      {sourceCurrency !== preferredCurrency && (
        <small className="text-gray-500 ml-2">
          (Original: {sourceCurrency === 'USD' ? '$' : ''}{amount} {sourceCurrency})
        </small>
      )}
    </div>
  );
};

export default CurrencyDisplay; 