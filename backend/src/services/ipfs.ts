import { Web3Storage, File } from 'web3.storage';
import { v4 as uuidv4 } from 'uuid';

const IPFS_API_KEY = process.env.IPFS_API_KEY;

let client: Web3Storage | null = null;

if (IPFS_API_KEY) {
  client = new Web3Storage({ token: IPFS_API_KEY });
}

export async function uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
  if (!client) {
    throw new Error('IPFS client not configured');
  }

  const file = new File([imageBuffer], filename, { type: 'image/jpeg' });
  const cid = await client.put([file], { wrapWithDirectory: false });
  
  return cid;
}

export async function uploadBatchMetadata(metadata: {
  residueType: string;
  weight: string;
  variety: string;
  quality: string;
  latitude: string;
  longitude: string;
  producerAddress: string;
  imageCid: string;
}): Promise<string> {
  if (!client) {
    throw new Error('IPFS client not configured');
  }

  const metadataObj = {
    name: `PERSÉA Batch ${uuidv4().slice(0, 8)}`,
    description: `Batch of ${metadata.residueType} from ${metadata.variety} avocado`,
    image: `ipfs://${metadata.imageCid}`,
    attributes: [
      { trait_type: 'Residue Type', value: metadata.residueType },
      { trait_type: 'Weight (kg)', value: metadata.weight },
      { trait_type: 'Variety', value: metadata.variety },
      { trait_type: 'Quality', value: metadata.quality },
      { trait_type: 'Latitude', value: metadata.latitude },
      { trait_type: 'Longitude', value: metadata.longitude },
      { trait_type: 'Producer', value: metadata.producerAddress },
    ],
    timestamp: new Date().toISOString(),
  };

  const file = new File([JSON.stringify(metadataObj, null, 2)], 'metadata.json', {
    type: 'application/json',
  });

  const cid = await client.put([file], { wrapWithDirectory: false });
  return cid;
}

export async function uploadDeliveryProof(
  latitude: string,
  longitude: string,
  timestamp: string,
  signature: string
): Promise<string> {
  if (!client) {
    throw new Error('IPFS client not configured');
  }

  const proof = {
    location: { latitude, longitude },
    timestamp,
    signature,
    verifiedAt: new Date().toISOString(),
  };

  const file = new File([JSON.stringify(proof, null, 2)], 'delivery-proof.json', {
    type: 'application/json',
  });

  const cid = await client.put([file], { wrapWithDirectory: false });
  return cid;
}

export function getIpfsUrl(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`;
}

export function getIpfsGateway(cid: string, gateway = 'ipfs.io'): string {
  return `https://${gateway}/ipfs/${cid}`;
}
