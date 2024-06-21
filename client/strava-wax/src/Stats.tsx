import axios from "axios";
import { FC } from "react";
import { FallingLines } from "react-loader-spinner";
import { useMutation, useQuery, useQueryClient } from "react-query";

type Stats = {
  currentKms: number;
  lastWaxed: number;
  needsWaxingIn: number;
  waxingInterval: number;
};

async function fetchData() {
  const response = await axios.get("http://localhost:4000/api/strava/stats");
  if (!response) {
    console.error("Network response was not ok");
    throw new Error("Network response was not ok");
  }
  return response.data as Stats;
}

async function patchWaxChain() {
  const response = await axios.patch("http://localhost:4000/api/strava");
  if (!response) {
    console.error("Network response was not ok");
    throw new Error("Network response was not ok");
  }
  return response.data as Stats;
}

export const Stats: FC = () => {
  const { data, isLoading, isError } = useQuery("stats", fetchData);
  const queryClient = useQueryClient();

  const { mutate: waxChain, isLoading: isLoadingUpdate } = useMutation({
    mutationFn: patchWaxChain,
    onSuccess: (data) => {
      queryClient.setQueryData("stats", data);
    },
  });
  if (isLoading || isLoadingUpdate) {
    return (
      <div>
        <FallingLines color="#fc5400" width="100" visible={true} />
      </div>
    );
  }

  if (isError) {
    return <div>Error: Something is wrong!</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      {data.needsWaxingIn <= 0 ? (
        <div>
          <p>Waxing is due now!</p>
          <button onClick={() => waxChain()}>Waxed my chain</button>
        </div>
      ) : (
        <div>
          <h2>Next waxing due in: {data.needsWaxingIn}km</h2>
          <p>Driven distance: {data.currentKms}km</p>
          <p></p>
        </div>
      )}
    </div>
  );
};
