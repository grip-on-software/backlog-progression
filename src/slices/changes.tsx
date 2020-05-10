import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { addAlert } from './alerts';

interface Change {
  created: number,
  id: number,
  issueId: number,
  field: "release" | "sprint" | "storyPoints",
  value: any,
}

interface Issue {
  id: number,
  key: string,
  created: number,
  sprintId?: number | null,
  storyPoints?: number | null,
  category?: "estimated" | "reestimatedHigher" | "reestimatedLower" | "unestimated",
}

export interface Sprint {
  id: number | null,
  label: string,
}

interface SprintState {
  id: number,
  created: number,
  name: string,
  children: any[]
}

interface State {
  sprintStates: SprintState[],
}

const initialState: State = {
  sprintStates: [],
};

const changesSlice = createSlice({
  name: "changes",
  initialState,
  reducers: {
    // applyChanges: (state: State, { payload }: { payload: { from: number, to: number } }) => {
    //   for (let i = payload.from; i <= payload.to; ++i) {
    //     const change = state.changelog[i];
    //     const issue = state.issues.find(issue => change.issueId === issue.id);
    //     if (!issue) continue;
        
    //     if ("sprint" === change.field) {
    //       const value = change.value as Sprint;
    //       let sprint = state.sprints.find(sprint => value.id === sprint.id);
    //       if (!sprint) {
    //         state.sprints.push(value);
    //       } else {
    //         sprint.label = value.label;
    //       }
    //       issue.sprintId = value.id;
    //     } else if ("storyPoints" === change.field) {
    //       const value = parseFloat(change.value);
    //       if (issue.storyPoints) {
    //         if (issue.storyPoints < value) {
    //           issue.category = "reestimatedHigher";
    //         } else if (issue.storyPoints > value) {
    //           issue.category = "reestimatedLower";
    //         } else {
    //           issue.category = "estimated";
    //         }
    //       } else {
    //         if (value) {
    //           issue.category = "reestimatedHigher";
    //         } else {
    //           issue.category = "unestimated";
    //         }
    //       }
    //       issue.storyPoints = value;
    //     }
    //   }
    // },
    // // deleteSprint: (state: State, { payload }: { payload: number }) => {
    // //   state.sprints = state.sprints.filter(sprint => payload !== sprint.id);
    // //   state.issues.forEach(issue => {
    // //     if (payload === issue.sprintId) {
    // //       issue.sprintId = null;
    // //     }
    // //   });
    // // },
    setSprintStates: (state: State, { payload }: { payload: SprintState[] }) => {
      state.sprintStates = payload
    },
    // setIssues: (state: State, { payload }: { payload: Issue[] }) => {
    //   state.issues = payload
    // },
    // // setSprints: (state: State, { payload }: { payload: Sprint }) => {
    // //   state.sprints = payload
    // // },
    // undoChanges: (state: State, { payload }: { payload: { to: number } }) => {
    //   console.log("Undo changes", payload.to);
    // },
    // // updateIssue: (state: State, { payload }: { payload: Sprint }) => {
    // //   const i = state.sprints.findIndex(s => payload.id === s.id);
    // //   if (-1 === i) {
    // //     state.sprints.push(payload);
    // //   } else {
    // //     state.sprints[i].label = payload.label;
    // //   }
    // // },
    // // updateSprint: (state: State, { payload }: { payload: Sprint }) => {
    // //   const i = state.sprints.findIndex(s => payload.id === s.id);
    // //   if (-1 === i) {
    // //     state.sprints.push(payload);
    // //   } else {
    // //     state.sprints[i].label = payload.label;
    // //   }
    // // },
  },
});

export const { setSprintStates } = changesSlice.actions;
export const changesSelector = (state: any) => state.changes as State;
export default changesSlice.reducer;

export const fetchSprintStates = (projectKey: string) => {
  return async (dispatch: Dispatch) => {
    try {
      const response = await fetch("data/IES/sprintStates.json");
      const data: SprintState[] = await response.json();
      dispatch(setSprintStates(data));
    } catch (error) {
      console.error(error);
      dispatch(addAlert({
        dismissible: false,
        message: "Something went wrong while fetching project history. Please reload the page.",
        variant: "danger"
      }));
    }
  }
}