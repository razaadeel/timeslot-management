[
    {
        "EnvName": "default",
        "LocalFleet": "true",
        "WorkFlow": [
            {
                "Name": "PRE_DEPLOY_BUILD",
                "PhaseType": 4,
                "BuildParams": "PHASE=PRE_DEPLOY_BUILD, FOO=BAR1",
                "Order": 0,
                "Parallelism": 1,
                "ContainerImage": "duplocloud/zbuilder:v7"
            },
            {
                "Name": "DEPLOY",
                "PhaseType": 1,
                "BuildParams": "PHASE=DEPLOY",
                "Order": 1,
                "Parallelism": 1,
                "ContainerImage": null
            }
        ]
    }
]