import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Seg from '../../components/Seg'

// Body measurements in cm. "–" ranges convert to inches number by number.
const GUIDE = {
    men: {
        head: ['Size', 'Chest', 'Waist', 'Sleeve'],
        rows: [['S', '91–96', '76–81', '63'], ['M', '97–102', '82–87', '64'], ['L', '103–108', '88–93', '65'], ['XL', '109–114', '94–99', '66'], ['XXL', '115–120', '100–105', '67']],
        m1: ['Chest', 'Under your arms, around the fullest part of your chest.'], m3: ['Sleeve', 'From the back of your neck, over the shoulder, to the wrist.'],
        tip: 'Slim-fit shirts sit close. Size up if you like room to move.',
    },
    women: {
        head: ['Size', 'Bust', 'Waist', 'Hip'],
        rows: [['XS', '78–81', '60–63', '86–89'], ['S', '82–85', '64–67', '90–93'], ['M', '86–89', '68–71', '94–97'], ['L', '90–94', '72–76', '98–102'], ['XL', '95–100', '77–82', '103–108']],
        m1: ['Bust', 'Around the fullest part of your bust, tape level across the back.'], m3: ['Hip', 'Around the fullest part of your hips, feet together.'],
        tip: 'Dresses are cut for the bust; skirts and trousers for the hip.',
    },
    kids: {
        head: ['Age', 'Height', 'Chest', 'Waist'],
        rows: [['2–3Y', '92–98', '52–54', '50–51'], ['4–5Y', '104–110', '56–58', '52–53'], ['6–7Y', '116–122', '60–62', '54–55'], ['8–9Y', '128–134', '64–66', '57–58']],
        m1: ['Height', 'Barefoot, back against a wall, from the floor to the top of the head.'], m3: ['Chest', 'Under the arms, around the fullest part of the chest.'],
        tip: 'Go by height, not age. A size up lasts longer.',
    },
};
const toInches = (v) => v.replace(/\d+/g, (n) => String(Math.round((n / 2.54) * 2) / 2));

// /size-guide?for=women — hovering a cell lights its column; the cell turns red.
const SizeGuide = () => {
    const [sp, setSp] = useSearchParams();
    const store = GUIDE[sp.get('for')] ? sp.get('for') : 'men';
    const [inches, setInches] = useState(false);
    const [hover, setHover] = useState(null); // [row, col]
    const g = GUIDE[store];

    return (
        <main className='wf-wrap wf-page wf-pagehead'>
            <p className='wf-kick'>Help</p>
            <h1>Size guide</h1>
            <p className='wf-intro'>Body measurements, not garment measurements. Between two sizes? Take the larger one.</p>
            <div className='wf-sgbar'>
                <Seg label='Store' options={[['men', 'Men'], ['women', 'Women'], ['kids', 'Kids']]} value={store} onChange={(v) => setSp({ for: v }, { replace: true })} />
                <div className='wf-switch'>
                    <span className={inches ? '' : 'on'}>cm</span>
                    <button type='button' aria-pressed={inches} aria-label={inches ? 'Show centimetres' : 'Show inches'} onClick={() => setInches((v) => !v)}></button>
                    <span className={inches ? 'on' : ''}>inches</span>
                </div>
            </div>
            <div className='wf-tblwrap'>
                <table className='wf-tbl wf-sg' onPointerLeave={() => setHover(null)}>
                    <thead><tr>{g.head.map((h, c) => <th key={h} className={c && hover?.[1] === c ? 'col' : ''}>{h}{c ? <small className='wf-muted'> ({inches ? 'in' : 'cm'})</small> : ''}</th>)}</tr></thead>
                    <tbody>
                        {g.rows.map((r, ri) => (
                            <tr key={r[0]}>
                                {r.map((v, c) => (
                                    <td key={c} onPointerEnter={() => setHover(c ? [ri, c] : null)}
                                        className={!c ? '' : hover?.[0] === ri && hover?.[1] === c ? 'hit' : hover?.[1] === c ? 'col' : ''}>
                                        {c && inches ? toInches(v) : v}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='wf-measure'>
                <div><i>1</i><b>{g.m1[0]}</b><p>{g.m1[1]}</p></div>
                <div><i>2</i><b>Waist</b><p>Around your natural waistline, the narrowest part. Keep one finger under the tape.</p></div>
                <div><i>3</i><b>{g.m3[0]}</b><p>{g.m3[1]}</p></div>
            </div>
            <p className='wf-tip'><b>Fit tip:</b> {g.tip}</p>
        </main>
    );
};

export default SizeGuide;
