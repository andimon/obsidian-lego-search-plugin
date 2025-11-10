import { LegoSet } from '@models/lego.model';
import * as utils from './utils';

jest.mock('@settings/settings', () => jest.fn());

describe('util.js', () => {
  const legoSet: LegoSet = {
    set_num: '75192-1',
    name: 'Millennium Falcon',
    year: 2017,
    num_parts: 7541,
  };

  it('replaceIllegalFileNameCharactersInString 1', () => {
    expect(utils.replaceIllegalFileNameCharactersInString('재레드 다이아몬드의 <대변동 : 위기, 선택, 변화>')).toBe(
      '재레드 다이아몬드의 대변동 위기 선택 변화',
    );
  });

  it('replaceIllegalFileNameCharactersInString 2', () => {
    expect(utils.replaceIllegalFileNameCharactersInString('2022 고시넷 초록이 NCS 모듈형 1 | 통합기본서(2판)')).toBe(
      '2022 고시넷 초록이 NCS 모듈형 1 통합기본서(2판)',
    );
  });

  it('makeFileName 1', () => {
    expect(utils.makeFileName(legoSet)).toBe('75192-1 - Millennium Falcon.md');
  });

  it('makeFileName 2', () => {
    const newSet = {
      ...legoSet,
      name: '',
    };
    expect(utils.makeFileName(newSet)).toBe('75192-1.md');
  });

  it('makeFileName 3', () => {
    expect(utils.makeFileName(legoSet, '{{set_num}}-{{name}}')).toBe('75192-1-Millennium Falcon.md');
  });

  it('makeFileName 4', () => {
    expect(utils.makeFileName(legoSet, '{{year}} {{name}}')).toBe('2017 Millennium Falcon.md');
  });

  it('makeFileName 5', () => {
    const newSet = {
      ...legoSet,
      name: 'UCS Millennium Falcon : Star Wars',
    };
    expect(utils.makeFileName(newSet, '{{name}} - {{set_num}}')).toBe('UCS Millennium Falcon Star Wars - 75192-1.md');
  });
});
