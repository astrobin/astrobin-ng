#!/bin/bash -ex

aws sts get-caller-identity

echo "Starting deploy script..."

AUTOSCALING_GROUP_NAME=$1
SLEEP_SECONDS=$2

echo "Describing Auto Scaling group: $AUTOSCALING_GROUP_NAME"

AUTOSCALING_GROUP_DESCRIPTION=$(aws autoscaling describe-auto-scaling-groups \
    --auto-scaling-group-names $AUTOSCALING_GROUP_NAME)
echo "Auto Scaling Group Description: $AUTOSCALING_GROUP_DESCRIPTION"

CURRENT_MIN_SIZE=$(echo "$AUTOSCALING_GROUP_DESCRIPTION" | jq -r ".AutoScalingGroups[0].MinSize")
CURRENT_MAX_SIZE=$(echo "$AUTOSCALING_GROUP_DESCRIPTION" | jq -r ".AutoScalingGroups[0].MaxSize")
CURRENT_DESIRED_CAPACITY=$(echo "$AUTOSCALING_GROUP_DESCRIPTION" | jq -r ".AutoScalingGroups[0].DesiredCapacity")

echo "Current Min Size: $CURRENT_MIN_SIZE, Max Size: $CURRENT_MAX_SIZE, Desired Capacity: $CURRENT_DESIRED_CAPACITY"

aws autoscaling update-auto-scaling-group \
    --auto-scaling-group-name ${AUTOSCALING_GROUP_NAME} \
    --min-size "$(($CURRENT_MIN_SIZE * 2))" \
    --max-size "$(($CURRENT_MAX_SIZE * 2))" \
    --desired-capacity "$(($CURRENT_DESIRED_CAPACITY * 2))"

echo "Sleeping for $SLEEP_SECONDS seconds..."
sleep ${SLEEP_SECONDS}

aws autoscaling update-auto-scaling-group \
    --auto-scaling-group-name ${AUTOSCALING_GROUP_NAME} \
    --min-size ${CURRENT_MIN_SIZE} \
    --max-size ${CURRENT_MAX_SIZE} \
    --desired-capacity ${CURRENT_DESIRED_CAPACITY}

echo "Finished deploy script."
