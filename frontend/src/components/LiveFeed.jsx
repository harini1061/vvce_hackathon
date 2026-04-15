import React from "react";

export default function LiveFeed({ transactions }) {
  return (
    <div className="card panel">
      <div className="panel-head">
        <h2>Live Transactions</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Country</th>
              <th>KYC</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.sender_account}</td>
                <td>{tx.receiver_account}</td>
                <td>₹{tx.amount}</td>
                <td>{tx.country}</td>
                <td>{tx.kyc_verified ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
