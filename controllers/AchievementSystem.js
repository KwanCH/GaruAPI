import { User } from "../models/User.js"
import { getTotalXP } from './LevelSystem.js';
import { format } from 'date-fns';



async function checkForAchivements(user) {
    const achievement = user.achievements
    const sessions = user.sessions

    if (achievement.firstSteps.achieved == false && sessions.length > 0) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.firstSteps.achieved': true,
                'achievements.firstSteps.dateAchieved':formatedDate(),

            },

            $inc: {
                'achievements.totalAchieved': 1 // Incrementing the counter
            }
        });

    }

    if (achievement.consistencyChampion.achieved === false && sessions.length > 6) {
        let achieved = true
        let daysCount = 0
        for (let i = sessions.length - 1; i > sessions.length-7; i--) {

            const date1 = new Date(sessions[i].date)
            const date2 = new Date(sessions[i - 1].date)

            //Date1 and date2 is in milliseconds after converting to
            //Date(), and 86400000 milliseconds equals 1 Day
            if (date1 - date2 > 86400000) {
                achieved = false
                break
            }

            if(date1.getDate() != date2.getDate()){
                daysCount++
            }
        }

        if (achieved && daysCount === 7) {
            await User.updateOne({ _id: user._id }, {
                $set: {
                    'achievements.consistencyChampion.achieved': true,
                    'achievements.consistencyChampion.dateAchieved':formatedDate(),
                },

                $inc: {
                    'achievements.totalAchieved': 1 // Incrementing the counter
                }
            });
        }

    }

    if (achievement.nightOwl.achieved === false && sessions.length > 0) {
        const time = new Date(sessions[sessions.length - 1].date);
        const hours = time.getHours();

        if (hours >= 21 || hours <= 4) {
            await User.updateOne({ _id: user._id }, {
                $set: {
                    'achievements.nightOwl.achieved': true,
                    'achievements.nightOwl.dateAchieved':formatedDate(),

                },

                $inc: {
                    'achievements.totalAchieved': 1 // Incrementing the counter
                }
            });
        }
    }

    if (achievement.earlyBird.achieved === false && sessions.length > 0) {
        const time = new Date(sessions[sessions.length - 1].date);
        const hours = time.getHours();

        if (hours >= 5 && hours <= 7) {
            await User.updateOne({ _id: user._id }, {
                $set: {
                    'achievements.earlyBird.achieved': true,
                    'achievements.earlyBird.dateAchieved':formatedDate(),

                },

                $inc: {
                    'achievements.totalAchieved': 1 // Incrementing the counter
                }
            });
        }

    }

    if (achievement.centuryClub.achieved === false && user.numberOfRuns > 99) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.centuryClub.achieved': true,
                'achievements.centuryClub.dateAchieved':formatedDate(),

            },

            $inc: {
                'achievements.totalAchieved': 1 // Incrementing the counter
            }
        });

    }

    if (achievement.collector.achieved === false && achievement.totalAchieved > 9) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.collector.achieved': true,
                'achievements.collector.dateAchieved':formatedDate(),

            },

            $inc: {
                'achievements.totalAchieved': 1 // Incrementing the counter
            }
        });
    }

    if (achievement.fiveKfinisher.achieved === false && sessions.length > 0) {
        if (sessions[sessions.length - 1].distance >= 5000) {
            await User.updateOne({ _id: user._id }, {
                $set: {
                    'achievements.fiveKfinisher.achieved': true,
                    'achievements.fiveKfinisher.dateAchieved':formatedDate(),
                },

                $inc: {
                    'achievements.totalAchieved': 1 // Incrementing the counter
                }
            });
        }

    }

    if (achievement.marathoner.achieved === false && user.totalDistance >= 42195) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.marathoner.achieved': true,
                'achievements.marathoner.dateAchieved':formatedDate(),

            },

            $inc: {
                'achievements.totalAchieved': 1 // Incrementing the counter
            }
        });
    }

    //TODO THIS IS GONNA TAKE 14 YEAAAAAR
    if (achievement.globetrotter.achieved === false && user.totalDistance >= 40075000) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.globetrotter.achieved': true,
                'achievements.globetrotter.dateAchieved':formatedDate(),

            },

            $inc: {
                'achievements.totalAchieved': 1 // Incrementing the counter
            }
        });

    }

    if (achievement.hourglass.achieved === false && sessions.length > 0 && user.totalDuration >= 86400000) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.hourglass.achieved': true,
                'achievements.hourglass.dateAchieved':formatedDate(),

            },

            $inc: {
                'achievements.totalAchieved': 1 // Incrementing the counter
            }
        });

    }

    if (achievement.theLongHaul.achieved === false
        && sessions.length > 0
        && sessions[sessions.length - 1].duration >= 2400000) {

        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.theLongHaul.achieved': true,
                'achievements.theLongHaul.dateAchieved':formatedDate(),

            },

            $inc: {
                'achievements.totalAchieved': 1 // Incrementing the counter
            }
        });

    }


    if (achievement.socialButterfly.achieved === false && user.friends.length > 4) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.socialButterfly.achieved': true,
                'achievements.socialButterfly.dateAchieved':formatedDate(),

            },

            $inc: {
                'achievements.totalAchieved': 1, // Incrementing the counter
            }
        });

    }

    if (achievement.motivator.achieved === false && user.streaks.length > 2) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.motivator.achieved': true,
                'achievements.motivator.dateAchieved':formatedDate(),

            },

            $inc: {
                'achievements.totalAchieved': 1 // Incrementing the counter
            }
        });

    }

    if (achievement.newYearsResolution.achieved === false && sessions.length > 0) {
        const date = new Date(sessions[sessions.length - 1].date)
        if (date.getMonth() == 0 && date.getDate() == 1) {
            await User.updateOne({ _id: user._id }, {
                $set: {
                    'achievements.newYearsResolution.achieved': true,
                    'achievements.newYearsResolution.dateAchieved':formatedDate(),

                },

                $inc: {
                    'achievements.totalAchieved': 1 // Incrementing the counter
                }
            });
        }
    }

    if (achievement.christmasGrind.achieved === false && sessions.length > 0) {
        //Running at Christmas eve
        const date = new Date(sessions[sessions.length - 1].date)
        if (date.getMonth() == 11 && date.getDate() == 24) {
            await User.updateOne({ _id: user._id }, {
                $set: {
                    'achievements.christmasGrind.achieved': true,
                    'achievements.christmasGrind.dateAchieved':formatedDate(),

                },

                $inc: {
                    'achievements.totalAchieved': 1 // Incrementing the counter
                }
            });
        }
    }

    if (achievement.levelUp.achieved === false && user.levelDetail.lvl > 9) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.levelUp.achieved': true,
                'achievements.levelUp.dateAchieved':formatedDate(),

            },

            $inc: {
                'achievements.totalAchieved': 1 // Incrementing the counter
            }
        });

    }

    if (achievement.xpCollector.achieved === false && getTotalXP(user) >= 10000) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.xpCollector.achieved': true,
                'achievements.xpCollector.dateAchieved':formatedDate(),
            },

            $inc: {
                'achievements.totalAchieved': 1 // Incrementing the counter
            }
        });

    }

}
async function checkForAchivementsOnRemoveFriend(user) {
    const achievement = user.achievements

    if (achievement.socialButterfly.achieved === true && user.friends.length < 5) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.socialButterfly.achieved': false,
            },

            $inc: {
                'achievements.totalAchieved': -1 // Incrementing the counter
            }
        });
    }

    if (achievement.motivator.achieved === true && user.streaks.length < 3) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.motivator.achieved': false,
            },

            $inc: {
                'achievements.totalAchieved': 1 // Incrementing the counter
            }
        });
    }

    if (achievement.collector.achieved == true && achievements.totalAchieved < 10) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.collector.achieved': false,
            },

            $inc: {
                'achievements.totalAchieved': -1 // Incrementing the counter
            }
        });
    }
}

async function checkForAchivementsOnRemoveSession(user, session) {
    const achievement = user.achievements
    const sessions = user.sessions

    if (achievement.firstSteps.achieved == true && sessions.length == 0) {
        //When deleted the last session log
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.firstSteps.achieved': false,
            },

            $inc: {
                'achievements.totalAchieved': -1 // Incrementing the counter
            }
        });
    }

    if (achievement.consistencyChampion.achieved === true && sessions.length < 7) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.consistencyChampion.achieved': false,
            },

            $inc: {
                'achievements.totalAchieved': -1 // Incrementing the counter
            }
        });
    }

    if (achievement.nightOwl.achieved === true) {
        let time = new Date(session.date);
        let hours = time.getHours();

        if (hours >= 21 || hours <= 4) {

            let notNightOwl = true

            if (sessions.length > 1) {
                for (let i = 0; i < user.sessions.length - 1; i++) {
                    time = new Date(sessions[i].date);
                    hours = time.getHours();

                    if (hours >= 21 || hours <= 4) {
                        notNightOwl = false
                        break
                    }
                }
            } else if (sessions.length == 1) {
                let time = new Date(sessions[0].date);
                let hours = time.getHours();
                if (hours >= 21 || hours <= 4) {
                    notNightOwl = false
                }
            }

            if (notNightOwl) {
                await User.updateOne({ _id: user._id }, {
                    $set: {
                        'achievements.nightOwl.achieved': false,
                    },

                    $inc: {
                        'achievements.totalAchieved': -1 // Incrementing the counter
                    }
                });
            }
        }
    }

    if (achievement.earlyBird.achieved === true) {
        let time = new Date(session.date);
        let hours = time.getHours();

        if (hours >= 5 || hours <= 7) {

            let notEarlyBird = true

            if (sessions.length > 1) {
                for (let i = 0; i < user.sessions.length - 1; i++) {
                    time = new Date(sessions[i].date);
                    hours = time.getHours();

                    if (hours >= 21 || hours <= 4) {
                        notEarlyBird = false
                        break
                    }
                }
            } else if (sessions.length == 1) {
                time = new Date(sessions[0].date);
                hours = time.getHours();
                if (hours >= 5 || hours <= 7) {
                    notEarlyBird = false
                }
            }

            if (notEarlyBird) {
                await User.updateOne({ _id: user._id }, {
                    $set: {
                        'achievements.earlyBird.achieved': false,
                    },

                    $inc: {
                        'achievements.totalAchieved': -1 // Incrementing the counter
                    }
                });
            }
        }
    }

    if (achievement.centuryClub.achieved === true && sessions.length < 100) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.centuryClub.achieved': false,
            },

            $inc: {
                'achievements.totalAchieved': -1 // Incrementing the counter
            }
        });
    }


    if (achievement.collector.achieved == true && achievements.totalAchieved < 10) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.collector.achieved': false,
            },

            $inc: {
                'achievements.totalAchieved': -1 // Incrementing the counter
            }
        });
    }


    if (achievement.fiveKfinisher.achieved == true) {

        if (session.distance > 4999) {
            let notFiveKfinisher = true

            if (user.sessions.length > 1) {
                for (let i = 0; i < user.sessions.length; i++) {
                    if (user.sessions[i].distance > 4999) {
                        notFiveKfinisher = false
                        break
                    }
                }
            } else if (user.sessions.length == 1) {
                if (sessions[0].distance > 4999) {
                    notFiveKfinisher = false
                }
            }

            if (notFiveKfinisher) {
                await User.updateOne({ _id: user._id }, {
                    $set: {
                        'achievements.fiveKfinisher.achieved': false,
                    },

                    $inc: {
                        'achievements.totalAchieved': -1 // Incrementing the counter
                    }
                });
            }
        }
    }

    if (achievement.marathoner.achieved == true && user.totalDistance < 42195) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.marathoner.achieved': false,
            },

            $inc: {
                'achievements.totalAchieved': -1 // Incrementing the counter
            }
        });
    }

    if (achievement.globetrotter.achieved === true && user.totalDistance < 40075000) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.globetrotter.achieved': false,
            },

            $inc: {
                'achievements.totalAchieved': -1 // Incrementing the counter
            }
        });
    }

    if (achievement.hourglass.achieved === true && user.totalDuration < 86400000) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.hourglass.achieved': false,
            },

            $inc: {
                'achievements.totalAchieved': -1 // Incrementing the counter
            }
        });
    }

    if (achievement.theLongHaul.achieved === true) {
        if (session.duration >= 2400000) {
            let notLongHaul = true

            if (user.sessions.length > 1) {
                for (let i = 0; i < user.sessions.length; i++) {
                    if (user.sessions[i].duration > 2400000) {
                        notLongHaul = false
                        break
                    }
                }
            } else if (user.sessions.length == 1) {
                if (sessions[0].distance > 2400000) {
                    notLongHaul = false
                }
            }

            if (notLongHaul) {
                await User.updateOne({ _id: user._id }, {
                    $set: {
                        'achievements.theLongHaul.achieved': false,
                    },

                    $inc: {
                        'achievements.totalAchieved': -1 // Incrementing the counter
                    }
                });
            }
        }
    }



    if (achievement.newYearsResolution.achieved === true) {
        let date = new Date(session.date)

        if (date.getMonth() == 0 && date.getDate() == 1) {
            let noNewYearsResolution = true

            if (user.sessions.length > 1) {
                for (let i = 0; i < user.sessions.length; i++) {
                    date = new Date(sessions[i].date)
                    if (date.getMonth() == 0 && date.getDate() == 1) {
                        noNewYearsResolution = false
                        break
                    }
                }
            } else if (user.sessions.length == 1) {
                date = new Date(sessions[0].date)
                if (date.getMonth() == 0 && date.getDate() == 1) {
                    noNewYearsResolution = false
                }
            }

            if (noNewYearsResolution) {
                await User.updateOne({ _id: user._id }, {
                    $set: {
                        'achievements.newYearsResolution.achieved': false,
                    },

                    $inc: {
                        'achievements.totalAchieved': -1 // Incrementing the counter
                    }
                });
            }
        }
    }

    if (achievement.christmasGrind.achieved === true) {
        let date = new Date(session.date)

        if (date.getMonth() == 11 && date.getDate() == 24) {
            let noChristmasGrind = true

            if (user.sessions.length > 1) {
                for (let i = 0; i < user.sessions.length; i++) {
                    date = new Date(sessions[i].date)
                    if (date.getMonth() == 11 && date.getDate() == 24) {
                        noChristmasGrind = false
                        break
                    }
                }
            } else if (user.sessions.length == 1) {
                date = new Date(sessions[0].date)
                if (date.getMonth() == 11 && date.getDate() == 24) {
                    noChristmasGrind = false
                }
            }

            if (noChristmasGrind) {
                await User.updateOne({ _id: user._id }, {
                    $set: {
                        'achievements.christmasGrind.achieved': false,
                    },

                    $inc: {
                        'achievements.totalAchieved': -1 // Incrementing the counter
                    }
                });
            }
        }
    }

    if (achievement.levelUp.achieved === true && user.levelDetail.lvl < 10) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.levelUp.achieved': false,
            },

            $inc: {
                'achievements.totalAchieved': -1 // Incrementing the counter
            }
        });
    }

    if (achievement.xpCollector.achieved === true && getTotalXP(user) < 10000) {
        await User.updateOne({ _id: user._id }, {
            $set: {
                'achievements.xpCollector.achieved': false,
            },

            $inc: {
                'achievements.totalAchieved': -1 // Incrementing the counter
            }
        });
    }
}

function formatedDate() {
    return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
}



export {
    checkForAchivements,
    checkForAchivementsOnRemoveSession,
    checkForAchivementsOnRemoveFriend,
};