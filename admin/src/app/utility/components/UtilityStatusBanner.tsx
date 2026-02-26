type Props = {
  pool: any;
};

export default function UtilityStatusBanner({ pool }: Props) {
  if (pool.paused) {
    return (
      <div className="p-3 bg-red-100 border border-red-300 rounded text-sm text-red-700">
        Airtime purchase is temporarily paused.
      </div>
    );
  }

  if (pool.balanceATC < pool.dailyLimitATC) {
    return (
      <div className="p-3 bg-yellow-100 border border-yellow-300 rounded text-sm">
        Low utility pool balance. Airtime availability may be limited.
      </div>
    );
  }

  return (
    <div className="p-3 bg-green-100 border border-green-300 rounded text-sm">
      Airtime utility is active.
    </div>
  );
}