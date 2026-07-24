import Loader from "@components/UI/Loader";
import { isSupabaseConfigured } from "@helpers/database";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import CreateContestForm from "./components/Form";
import CreateContestDeploying from "./components/Deploying";
import { useCreateContestFormStore } from "./store";

const CreateFlow = () => {
  const { isLoading, isSuccess } = useDeployContestStore(
    useShallow(state => ({
      isLoading: state.isLoading,
      isSuccess: state.isSuccess,
    })),
  );
  const resetForm = useCreateContestFormStore(state => state.reset);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    return () => resetForm();
  }, [resetForm]);

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col gap-3 justify-center items-center mt-40">
        <p className="text-[24px] font-sabo-filled text-neutral-11">
          Oops, it seems you've forgotten to include environmental variables!
        </p>
        <p className="text-[16px]">
          for more details, visit{" "}
          <a className="text-positive-11" href="https://github.com/jk-labs-inc/confetti#readme" target="_blank">
            <b>here!</b>
          </a>
        </p>
      </div>
    );
  }

  if (!hasMounted) {
    return <Loader />;
  }

  return <div className="px-4">{isLoading || isSuccess ? <CreateContestDeploying /> : <CreateContestForm />}</div>;
};

export default CreateFlow;
