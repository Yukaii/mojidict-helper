import { createSlice, createAsyncThunk} from "@reduxjs/toolkit";

const initialState = {
	showCard: false,
	searchKeyword: null,
	selectionRect: null
};

// export const getItem = createAsyncThunk(
// 	"moji/getItem",
// 	async (name, thunkAPI) => {
// 		return new Promise((resolve) => {
// 			chrome.storage.sync.get([name], function (result) {
// 				resolve(result.key);
// 			});
// 		});
// 	}
// );



export const mojiSlice = createSlice({
	name: "moji",
	initialState,
	reducers: {
		setShowCard: (state, action) => {
			state.showCard = action.payload;
		},
		setSearchKeyword: (state, action) => {
			state.searchKeyword = action.payload;
		},
		setSelectionRect: (state, action) => {
			state.selectionRect = action.payload;
		}
	}
});

export const { setShowCard, setSearchKeyword, setSelectionRect } = mojiSlice.actions;

export default mojiSlice.reducer;

