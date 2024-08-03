export default function TokensList() {
  const tokensList = [
    { name: "Bangladeshi Digital Taka", ticker: "BDT", value: 10000 },
    { name: "United States Dollars", ticker: "USD", value: 100 },
  ];
  const usdPrice = 118;

  return (
    <div className="bg-white rounded-xl p-4 mt-4 text-gray-800">
      {tokensList.map((token, index) => (
        <div
          key={index}
          className="flex justify-between items-center py-3 border-b border-gray-200"
        >
          <div className="flex gap-2 w-2/3">
            <div className="rounded-full h-12 bg-blue-300 flex justify-center items-center w-12">
              {token.ticker[0]}
            </div>
            <div className="text-sm mt-1">{token.name}</div>
          </div>
          {token.ticker !== "USD" ? (
            <div className="text-right">
              <div className="font-bold">
                ${(token.value / usdPrice).toFixed(2)}
              </div>
              <div className="text-sm">
                {token.value} {token.ticker}
              </div>
            </div>
          ) : (
            <div className="text-right">
              <div className="font-bold">${token.value}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
