/**
 * Created by pi on 7/22/16.
 */

var ConfigureMenus = [
    {
        name: 'Immigration Services',
        SubMenus: [
            {
                name: 'Students',
                url: '/warehouse/logisticUnitList/:WH'
            },
            {
                name: 'Privatiers',
                url: '/warehouse/logisticUnitList/:dis1'
            },
            {
                name: 'Entrepreneurs',
                url: '/warehouse/logisticUnitList/:FP'
            },
            {
                name: 'Expatriates',
                url: '/warehouse/Lots'
            }
        ],
        url: '#'
    },
    {
        name: 'Resources',
        url: '#'
    },
    {
        name: 'Contact',
        SubMenus: [
            {
                name: 'Impressum',
                navigation : true,
                url: '#'

            }
        ],
        url: '#'
    },
    {
        name: 'FAQ',
        url: '#'
    }

    // {
    //     name: 'Language',
    //     SubMenus: [
    //         {
    //             name: 'English',
    //             keepPage: true,
    //             url: '/en'
    //         },
    //         {
    //             name: 'Chinese',
    //             keepPage: true,
    //             url: '/zh'
    //         },
    //         {
    //             name: 'Russian',
    //             keepPage: true,
    //             url: '/ru'
    //         }
    //     ],
    //     url: '#'
    // }
];
module.exports = ConfigureMenus;