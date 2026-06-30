import { safeCompareVersions } from "@helpers/versions";
import { METADATA_FIELDS_VERSION } from "constants/versions";
import { useEffect } from "react";
import { Abi } from "viem";
import { useReadContract } from "wagmi";
import { useShallow } from "zustand/shallow";
import { parseMetadataFieldsSchema } from "./helpers";
import { useMetadataStore } from "./store";

interface UseMetadataFieldsParams {
  address: `0x${string}`;
  chainId: number;
  abi: Abi;
  version: string;
  enabled?: boolean;
}

const useMetadataFields = ({ address, chainId, abi, version, enabled = true }: UseMetadataFieldsParams) => {
  const setFields = useMetadataStore(useShallow(state => state.setFields));

  const {
    data: metadataSchema,
    isError: isMetadataError,
    isLoading: isMetadataLoading,
  } = useReadContract({
    abi: abi,
    address: address,
    chainId: chainId,
    functionName: "metadataFieldsSchema",
    query: {
      enabled: enabled && !!version && (safeCompareVersions(version, METADATA_FIELDS_VERSION) ?? -1) >= 0,
    },
  });

  useEffect(() => {
    if (typeof metadataSchema === "string") {
      const parsedFields = parseMetadataFieldsSchema(metadataSchema);
      setFields(parsedFields);
    } else if (metadataSchema !== undefined || isMetadataError) {
      console.error("Unexpected data type or error from metadataFieldsSchema");
      setFields([]);
    }
  }, [metadataSchema, isMetadataError, setFields]);

  return {
    isLoading: isMetadataLoading,
    isError: isMetadataError,
  };
};

export default useMetadataFields;
