using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlanMP.API.Application.Tasks.Commands;
using PlanMP.API.Application.Tasks.Queries;
using PlanMP.API.Application.Common.Models;
using PlanMP.API.Application.Common.Security;

namespace PlanMP.API.Controllers;

[Authorize]
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
public class TasksController : ApiControllerBase
{
    [HttpGet]
    [RequiresPermission(Permissions.Tasks.View)]
    public async Task<ActionResult<PaginatedList<TaskDto>>> GetTasks([FromQuery] GetTasksQuery query)
    {
        return await Mediator.Send(query);
    }

    [HttpGet("{id}")]
    [RequiresPermission(Permissions.Tasks.View)]
    public async Task<ActionResult<TaskDto>> GetTask(int id)
    {
        return await Mediator.Send(new GetTaskByIdQuery { Id = id });
    }

    [HttpPost]
    [RequiresPermission(Permissions.Tasks.Create)]
    public async Task<ActionResult<int>> Create(CreateTaskCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpPut("{id}")]
    [RequiresPermission(Permissions.Tasks.Edit)]
    public async Task<ActionResult> Update(int id, UpdateTaskCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest();
        }

        await Mediator.Send(command);

        return NoContent();
    }

    [HttpPatch("{id}/status")]
    [RequiresPermission(Permissions.Tasks.Edit)]
    public async Task<ActionResult> UpdateStatus(int id, UpdateTaskStatusCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest();
        }

        await Mediator.Send(command);

        return NoContent();
    }

    [HttpPatch("{id}/progress")]
    [RequiresPermission(Permissions.Tasks.Edit)]
    public async Task<ActionResult> UpdateProgress(int id, UpdateTaskProgressCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest();
        }

        await Mediator.Send(command);

        return NoContent();
    }

    [HttpPatch("{id}/assignee")]
    [RequiresPermission(Permissions.Tasks.Assign)]
    public async Task<ActionResult> UpdateAssignee(int id, UpdateTaskAssigneeCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest();
        }

        await Mediator.Send(command);

        return NoContent();
    }

    [HttpPost("{id}/tags")]
    [RequiresPermission(Permissions.Tasks.Edit)]
    public async Task<ActionResult> AddTag(int id, AddTaskTagCommand command)
    {
        if (id != command.TaskId)
        {
            return BadRequest();
        }

        await Mediator.Send(command);

        return NoContent();
    }

    [HttpDelete("{id}/tags/{tagId}")]
    [RequiresPermission(Permissions.Tasks.Edit)]
    public async Task<ActionResult> RemoveTag(int id, int tagId)
    {
        await Mediator.Send(new RemoveTaskTagCommand { TaskId = id, TagId = tagId });

        return NoContent();
    }

    [HttpPost("{id}/dependencies")]
    [RequiresPermission(Permissions.Tasks.Edit)]
    public async Task<ActionResult> AddDependency(int id, AddTaskDependencyCommand command)
    {
        if (id != command.TaskId)
        {
            return BadRequest();
        }

        await Mediator.Send(command);

        return NoContent();
    }

    [HttpDelete("{id}/dependencies/{dependencyId}")]
    [RequiresPermission(Permissions.Tasks.Edit)]
    public async Task<ActionResult> RemoveDependency(int id, int dependencyId)
    {
        await Mediator.Send(new RemoveTaskDependencyCommand { TaskId = id, DependencyId = dependencyId });

        return NoContent();
    }

    [HttpGet("{id}/history")]
    [RequiresPermission(Permissions.Tasks.View)]
    public async Task<ActionResult<List<TaskHistoryDto>>> GetHistory(int id)
    {
        return await Mediator.Send(new GetTaskHistoryQuery { TaskId = id });
    }

    [HttpDelete("{id}")]
    [RequiresPermission(Permissions.Tasks.Delete)]
    public async Task<ActionResult> Delete(int id)
    {
        await Mediator.Send(new DeleteTaskCommand { Id = id });

        return NoContent();
    }

    [HttpGet("by-initiative/{initiativeId}")]
    [RequiresPermission(Permissions.Tasks.View)]
    public async Task<ActionResult<List<TaskDto>>> GetTasksByInitiative(int initiativeId)
    {
        return await Mediator.Send(new GetTasksByInitiativeQuery { InitiativeId = initiativeId });
    }

    [HttpGet("by-user/{userId}")]
    [RequiresPermission(Permissions.Tasks.View)]
    public async Task<ActionResult<List<TaskDto>>> GetTasksByUser(string userId)
    {
        return await Mediator.Send(new GetTasksByUserQuery { UserId = userId });
    }

    [HttpGet("dashboard")]
    [RequiresPermission(Permissions.Tasks.View)]
    public async Task<ActionResult<TaskDashboardDto>> GetDashboard()
    {
        return await Mediator.Send(new GetTaskDashboardQuery());
    }
} 