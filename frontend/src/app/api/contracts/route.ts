import { NextResponse } from 'next/server';

const CONTRACTS = {
  skinTrace: '0x1Deed2c283b950439E1AfE726AEb7Ee257E6aa41',
  pitMarket: '0x1d6975d2C0e466928b7dEB47fe48fAD3624A983B',
  seedScore: '0x946Ed93acCaF382617409F03938537fC41454B7B',
  perseaToken: '0x58fe512A24A5d3160a8B161C64623f40d4bD113d',
};

export async function GET() {
  return NextResponse.json({ success: true, data: CONTRACTS });
}
