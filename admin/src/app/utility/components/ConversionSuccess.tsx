type Props = {
  data: any;
};

export default function ConversionSuccess({ data }: Props) {
  return (
    <div className="p-4 bg-green-50 border border-green-300 rounded text-sm">
      <p className="font-semibold text-green-700">
        Airtime Sent Successfully
      </p>

      <p>
        Airtime Value:{" "}
        <strong>
          {data.airtimeValue} GHS
        </strong>
      </p>

      <p>
        New ATC Balance:{" "}
        <strong>
          {data.newBalanceATC.toFixed(4)}
        </strong>
      </p>
    </div>
  );
}