import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { addAlert } from './alerts';

interface Change {
  id: number,
  created: number,
}

interface Issue {
  id: number,
  label: string,
  created: number,
  lastChange: Change,
}

export interface Project {
  isCore: boolean,
  isRecent: boolean,
  key: string,
  name: string,
  releases: Release[],
};

export interface Release {
  id: number,
  label: string,
}

export interface Sprint {
  id: number | null,
  label: string,
  issues: Issue[],
}

interface State {
  date: number,
  includeUnestimated: boolean,
  project: Project | null,
  projects: Project[],
  releases: Release[],
  sprints: Sprint[],
}

const initialState: State = {
  date: 0,
  includeUnestimated: false,
  project: null,
  projects: [],
  releases: [],
  sprints: [
    {
      id: null,
      label: "Backlog",
      issues: []
    }
  ],
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    addSprint: (state: State, { payload }: { payload: Sprint }) => {
      state.sprints.push(payload)
    },
    deleteSprint: (state: State, { payload }: { payload: number }) => {
      const sprint = state.sprints.find(sprint => payload === sprint.id);
      if (sprint?.issues?.length) {
        const backlog = state.sprints.find(sprint => null === sprint.id);
        sprint.issues.forEach(issue => backlog?.issues.push(issue));
      }
      state.sprints = state.sprints.filter(sprint => payload !== sprint.id);
    },
    resetReleases: (state: State) => {
      state.releases = []
    },
    setDate: (state: State, { payload }: { payload: number }) => {
      state.date = payload
    },
    setProject: (state: State, { payload }: { payload: Project | null }) => {
      state.project = payload
    },
    setProjects: (state: State, { payload }: { payload: Project[] }) => {
      state.projects = payload
    },
    setReleases: (state: State, { payload }: { payload: Release[] }) => {
      state.releases = payload
    },
    toggleUnestimated: (state: State) => {
      state.includeUnestimated = !state.includeUnestimated;
    }
  },
});

export const { addSprint, deleteSprint, resetReleases, setDate, setProject, setProjects, setReleases, toggleUnestimated } = configSlice.actions;
export const configSelector = (state: any) => state.config as State;
export default configSlice.reducer;

export const fetchProjects = () => {
  return async (dispatch: Dispatch) => {
    try {
      const response = await fetch("data/projects.json");
      const data: Project[] = await response.json();
      dispatch(setProjects(data));
    } catch (error) {
      console.error(error);
      dispatch(addAlert({
        dismissible: false,
        message: "Something went wrong while fetching projects. Please reload the page.",
        variant: "danger"
      }));
    }
  }
}
