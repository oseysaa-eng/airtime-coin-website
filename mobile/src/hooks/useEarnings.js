"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useEarnings;
const react_1 = require("react");
const axios_1 = __importDefault(require("axios"));
function useEarnings(userId) {
    const [data, setData] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchEarnings = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios_1.default.get(`https://api.airtimecoin.com/earnings?user=${userId}`);
            setData(response.data.transactions);
        }
        catch (err) {
            setError('Failed to fetch earnings');
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchEarnings();
    }, []);
    return { data, loading, error, refresh: fetchEarnings };
}
