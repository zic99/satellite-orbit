const columns = [
    {
        title: '',
        dataIndex: 'index',
        key: 'index',
        width: 50,
      
        render:(value,record,index) => {
            return <span>{index+1}</span>
        }
    },
    {
        title: <span>Δa(m)</span>,
        dataIndex: 'Da',
        key: 'da',
        width: 50,
        render: (value) => value.toFixed(1)
    },
    {
        title: <span>TCA_new</span>,
        dataIndex: 'NewTca',
        key: 'newTca',
        width: 180,
        render: (value) => {
            return value ? value.slice(0,23).split("T"): "/"
        }

    },
    {
        title: <span>Distance(km)</span>,
        width:260,
        key:"distance",
        children:[
            {
                title:<span>total</span>,
                dataIndex:"RangeTotal",
                key:"RangeTotal",
                width:60,
                render: (value) => value.toFixed(1)

            },
            {
                title:<span>U</span>,
                dataIndex:"RangeU",
                key:"RangeU",
                width:60,
                render: (value) => value.toFixed(1)

            },
            {
                title:<span>N</span>,
                dataIndex:"RangeN",
                key:"RangeN",
                width:60,
                render: (value) => value.toFixed(1)

            },
            {
                title:<span>W</span>,
                dataIndex:"RangeW",
                key:"RangeW",
                width:60,
                render: (value) => value.toFixed(1)

            },
        ]
    },
    {
        title: <span>Result</span>,
        dataIndex: 'Warning',
        key: 'Warning',
        width: 80,
        render:(value)=> {
            switch (value) {
                case -1:
                    return "free"
                case 0:
                    return "yellow"
                case 1:
                    return "red"
                default:
                    break;
            }
        }
    },
];

const warnColumns = [
    {
        title:<span>TCA</span>,
        dataIndex:"CollisionTime",
        key:"TCA(UTC)",
        render: (value) => {
            const time = value.replace("T"," ").slice(0,22).split(" ");
        
            return <span>{time[0]} {time[1]+"Z"}</span>
        },
        width:180
    },
    {
        title:<span>N_sat</span>,
        dataIndex:"NORADNum1",
        key:"N_sat",
        width:75
    },
    {
        title:<span>N_tar</span>,
        dataIndex:"NORADNum2",
        key:"N_tar",
        width:75
    },
    {
        title:<span>距离(km)</span>,
        dataIndex:"MinRange",
        key:"Range(km)",
        render: (value) => Math.abs(value),
        width:90
    },
    {
        title:<span>U方向距离(km)</span>,
        dataIndex:"RangeU",
        key:"U(km)",
        render: (value) => Math.abs(value),
        width:75
    },
    {
        title:<span>N方向距离(km)</span>,
        dataIndex:"RangeN",
        key:"NORADNum2",
        render: (value) => Math.abs(value),
        width:75
    },
    {
        title:<span>W方向距离(km)</span>,
        dataIndex:"RangeW",
        key:"NORADNum2",
        render: (value) => Math.abs(value),
        width:75
    },
    // {
    //     title:<span>Pc</span>,
    //     dataIndex:"CollisionProbability",
    //     key:"NORADNum2",
    //     render: (value) => Number(value).toExponential(2),
    //     width:75
    // },
    {
        title:<span>相对速度(km/s)</span>,
        dataIndex:"RelativeVelocity",
        key:"NORADNum2",
        render: (value) => Number(value).toFixed(2),
        width:90
    },
    {
        title:<span>交汇角度(deg)</span>,
        dataIndex:"CollAngle",
        key:"NORADNum2",
        render: (value) => Number(value).toFixed(2),
        width:80
    }
]

export {columns,warnColumns}