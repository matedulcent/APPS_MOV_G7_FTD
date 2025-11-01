import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BASE_URL } from "../../app/services/apiConfig";

export type Sabor = {
    id: string;
    tipoSabor: string;
};

interface SaboresState {
    items: Sabor[];
    loading: boolean;
    error?: string;
}

// thunk para cargar sabores desde la API
export const fetchSabores = createAsyncThunk<Sabor[], string>(
    "sabores/fetchSabores",
    async (sucursalId, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/api/sucursales/${sucursalId}/oferta`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Error al cargar sabores");
            return data.sabores || [];
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const initialState: SaboresState = {
    items: [],
    loading: false,
};

const saboresSlice = createSlice({
    name: "sabores",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSabores.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(fetchSabores.fulfilled, (state, action: PayloadAction<Sabor[]>) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchSabores.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default saboresSlice.reducer;
