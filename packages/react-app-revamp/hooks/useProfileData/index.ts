import { DEFAULT_AVATAR_URL } from "@components/UI/Avatar/constants";
import { Clusters, getImageUrl, getProfileUrl } from "@clustersxyz/sdk";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import shortenEthereumAddress from "@helpers/shortenEthereumAddress";
import { useQuery } from "@tanstack/react-query";
import { getEnsAvatar, getEnsName } from "@wagmi/core";
import { normalize } from "viem/ens";
import { mainnet } from "wagmi/chains";
const ETHERSCAN_BASE_URL = mainnet.blockExplorers?.default?.url;

interface ProfileData {
  profileName: string;
  profileAvatar: string;
  socials: {
    etherscan: string;
    cluster: string;
  };
}

const checkImageUrl = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeoutId = setTimeout(() => {
      img.onload = img.onerror = null;
      reject(new Error("Timeout waiting for image to load"));
    }, 10000);
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(url);
    };
    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error("Image loading error"));
    };
    img.src = url;
  });
};

const fetchProfileData = async (
  ethereumAddress: string,
  shortenOnFallback: boolean,
  includeSocials?: boolean,
): Promise<ProfileData> => {
  let profileName = shortenOnFallback ? shortenEthereumAddress(ethereumAddress) : ethereumAddress;
  let profileAvatar = DEFAULT_AVATAR_URL;
  let socials = {
    etherscan: "",
    cluster: "",
  };
  const clusters = new Clusters();

  try {
    const ensName = await getEnsName(getWagmiConfig(), {
      address: ethereumAddress as `0x${string}`,
      chainId: mainnet.id,
    });

    if (ensName) {
      const timeout = new Promise<string>((resolve, reject) => {
        setTimeout(() => reject(new Error("timeout: ENS avatar request took too long")), 10000);
      });

      const ensAvatarPromise = getEnsAvatar(getWagmiConfig(), {
        name: normalize(ensName),
        chainId: mainnet.id,
      });

      try {
        let ensAvatar = await Promise.race([ensAvatarPromise, timeout]);

        ensAvatar = typeof ensAvatar === "string" ? ensAvatar : DEFAULT_AVATAR_URL;

        await checkImageUrl(ensAvatar);
        profileAvatar = ensAvatar;
        profileName = ensName;
      } catch (error) {
        profileName = ensName;
        profileAvatar = DEFAULT_AVATAR_URL;
      }
    } else {
      const clusterName = (await clusters.getName(ethereumAddress)).clusterName;

      if (clusterName) {
        try {
          const imageUrl = getImageUrl(clusterName);

          await checkImageUrl(imageUrl ?? DEFAULT_AVATAR_URL);
          profileAvatar = imageUrl ?? DEFAULT_AVATAR_URL;
          profileName = clusterName;
        } catch {
          profileName = clusterName;
          profileAvatar = DEFAULT_AVATAR_URL;
        }
      }
    }

    if (includeSocials) {
      const clusterName = (await clusters.getName(ethereumAddress)).clusterName;
      let clusterProfileUrl = "";

      if (clusterName) {
        const clusterMetadata = getProfileUrl(clusterName);
        clusterProfileUrl = clusterMetadata ?? "";
      }

      socials = {
        etherscan: `${ETHERSCAN_BASE_URL}/address/${ethereumAddress}`,
        cluster: clusterProfileUrl,
      };
    }
  } catch (error) {
    console.error(error);
  }

  return { profileName, profileAvatar, socials };
};

const useProfileData = (ethereumAddress: string, shortenOnFallback: boolean, includeSocials?: boolean) => {
  const { data, isLoading, isError, error } = useQuery<ProfileData>({
    queryKey: [ethereumAddress, shortenOnFallback, includeSocials],
    queryFn: () => fetchProfileData(ethereumAddress, shortenOnFallback, includeSocials),
    enabled: !!ethereumAddress || !!includeSocials,
    staleTime: 1000 * 60 * 60,
  });

  return {
    profileName:
      data?.profileName ??
      (shortenOnFallback ? `${ethereumAddress.substring(0, 6)}...${ethereumAddress.slice(-3)}` : ethereumAddress),
    profileAvatar: data?.profileAvatar ?? DEFAULT_AVATAR_URL,
    socials: data?.socials,
    isLoading,
    isError,
    error,
  };
};

export default useProfileData;
