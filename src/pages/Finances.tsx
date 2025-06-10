import React from 'react';

export const Finances: React.FC = () => {
  return (
    <div className="finances-page">
      <h1>Фінанси</h1>
      <div className="finances-content">
        <section className="finances-section">
          <h2>Загальний огляд</h2>
          <div className="finances-summary">
            <div className="summary-card">
              <h3>Доходи</h3>
              <p className="amount income">₴0.00</p>
            </div>
            <div className="summary-card">
              <h3>Витрати</h3>
              <p className="amount expense">₴0.00</p>
            </div>
            <div className="summary-card">
              <h3>Баланс</h3>
              <p className="amount balance">₴0.00</p>
            </div>
          </div>
        </section>

        <section className="finances-section">
          <h2>Останні транзакції</h2>
          <div className="transactions-list">
            <p className="empty-state">Поки що немає транзакцій</p>
          </div>
        </section>
      </div>
    </div>
  );
}; 