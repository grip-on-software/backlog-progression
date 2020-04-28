import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { addAlert } from './alerts';

interface Release {
  id: number,
  name: string,
}

export interface Project {
  isCore: boolean,
  isRecent: boolean,
  key: string,
  name: string,
  releases: Release[],
};

interface State {
  includeUnestimated: boolean,
  project: Project | null,
  projects: Project[],
  releases: Release[],
}

const initialState: State = {
  includeUnestimated: false,
  project: null,
  projects: [],
  releases: [],
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    resetReleases: (state: State) => {
      state.releases = []
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

export const { resetReleases, setProject, setProjects, setReleases, toggleUnestimated } = configSlice.actions;
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