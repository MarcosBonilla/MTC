import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

interface UnavailableDatesManagerProps {
  className?: string;
}

const UnavailableDatesManager: React.FC<UnavailableDatesManagerProps> = ({ className }) => {
  const { state, addUnavailableDate, removeUnavailableDate } = useApp();
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;

    setIsLoading(true);
    setError(null);

    try {
      await addUnavailableDate(newDate);
      setNewDate('');
      setReason('');
    } catch (error) {
      console.error('Error adding unavailable date:', error);
      setError('Error adding date. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDate = async (dateId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await removeUnavailableDate(dateId);
    } catch (error) {
      console.error('Error removing unavailable date:', error);
      setError('Error removing date. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <div className="section-header">
        <h3>Unavailable Dates Management</h3>
        <p>Add dates when the studio will be closed or unavailable for bookings.</p>
      </div>

      {/* Add new unavailable date */}
      <form onSubmit={handleAddDate} className="add-date-form">
        <div className="form-group">
          <label htmlFor="newDate">Date</label>
          <input
            type="date"
            id="newDate"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="reason">Reason (Optional)</label>
          <input
            type="text"
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Holiday, Maintenance, etc."
            className="form-input"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !newDate}
          className="btn btn-primary"
        >
          {isLoading ? 'Adding...' : 'Add Unavailable Date'}
        </button>
      </form>

      {error && (
        <div className="error-message" style={{
          color: '#ef4444',
          padding: '1rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          marginTop: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* List of unavailable dates */}
      <div className="unavailable-dates-list">
        <h4>Current Unavailable Dates</h4>
        
        {state.studioSettings?.unavailableDates?.length === 0 ? (
          <p className="no-dates">No unavailable dates set.</p>
        ) : (
          <div className="dates-grid">
            {(state.studioSettings?.unavailableDates || [])
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((unavailableDate: any) => (
                <div key={unavailableDate.id} className="date-card">
                  <div className="date-info">
                    <div className="date-display">
                      {format(new Date(unavailableDate.date), 'dd/MM/yyyy')}
                    </div>
                    {unavailableDate.reason && (
                      <div className="date-reason">
                        {unavailableDate.reason}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleRemoveDate(unavailableDate.id)}
                    disabled={isLoading}
                    className="remove-btn"
                    title="Remove this date"
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      <style>{`
        .section-header {
          margin-bottom: 2rem;
        }

        .section-header h3 {
          color: var(--white);
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .section-header p {
          color: var(--gray-400);
          font-size: 1rem;
        }

        .add-date-form {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 1rem;
          align-items: end;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: var(--white);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .form-input {
          padding: 0.75rem;
          background: var(--gray-800);
          border: 1px solid var(--gray-600);
          border-radius: 8px;
          color: var(--white);
          font-family: 'Inter', sans-serif;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent);
          background: var(--gray-700);
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: var(--accent);
          color: var(--black);
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--accent-light);
          transform: translateY(-1px);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .unavailable-dates-list h4 {
          color: var(--white);
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

        .no-dates {
          color: var(--gray-400);
          font-style: italic;
          text-align: center;
          padding: 2rem;
        }

        .dates-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }

        .date-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .date-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .date-info {
          flex: 1;
        }

        .date-display {
          color: var(--white);
          font-weight: 500;
          font-size: 1rem;
        }

        .date-reason {
          color: var(--gray-400);
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        .remove-btn {
          background: rgba(239, 68, 68, 0.1);
          color: rgb(239, 68, 68);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .remove-btn:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
          transform: scale(1.1);
        }

        .remove-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .add-date-form {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .dates-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default UnavailableDatesManager;